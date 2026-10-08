import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, form, max, min } from '@angular/forms/signals';

import { CATEGORIES, SORT_OPTIONS } from '../../constants/api-constants';
import {
  Category,
  Product,
  SortOption,
  SubCategory,
} from '../../interfaces/product-interface';
import { ProductService } from '../../services/product-service';
import { EgpPipe } from '../../components/egp-pipe';
import { Icon } from '../../components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';

interface FilterModel {
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
  inStockOnly: boolean;
}

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormField, ProductCard, Icon, EgpPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletons = Array.from({ length: 9 });

  protected readonly category = computed(
    () => (this.params().get('category') as Category | null) ?? null
  );
  protected readonly subCategory = computed(
    () => (this.queryParams().get('sub') as SubCategory | null) ?? null
  );
  protected readonly searchTerm = computed(() => this.queryParams().get('q') ?? '');

  protected readonly categoryMeta = computed(() =>
    CATEGORIES.find((entry) => entry.slug === this.category())
  );
  protected readonly heading = computed(() => {
    const term = this.searchTerm();
    if (term) return `Results for “${term}”`;

    const sub = this.subCategory();
    if (sub) return sub.charAt(0).toUpperCase() + sub.slice(1);

    return this.categoryMeta()?.label ?? 'All products';
  });

  // --- Signal Forms: the price / sort / availability filters ---
  protected readonly filterModel = signal<FilterModel>({
    minPrice: 0,
    maxPrice: 0,
    sort: 'newest',
    inStockOnly: false,
  });

  protected readonly filterForm = form(this.filterModel, (path) => {
    min(path.minPrice, 0, { message: 'Price cannot be negative' });
    max(path.maxPrice, 1_000_000, { message: 'That is above our highest price' });
  });

  protected readonly selectedBrands = signal<string[]>([]);
  protected readonly availableBrands = signal<string[]>([]);
  protected readonly priceBounds = signal({ min: 0, max: 0 });
  protected readonly page = signal(1);

  protected readonly products = signal<Product[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly filtersOpen = signal(false);

  protected readonly activeFilterCount = computed(() => {
    const model = this.filterModel();
    const bounds = this.priceBounds();
    let count = this.selectedBrands().length;
    if (model.minPrice > bounds.min) count++;
    if (model.maxPrice > 0 && model.maxPrice < bounds.max) count++;
    if (model.inStockOnly) count++;
    return count;
  });

  protected readonly priceRangeInvalid = computed(() => {
    const { minPrice, maxPrice } = this.filterModel();
    return maxPrice > 0 && minPrice > maxPrice;
  });

  private debounceId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Reset filters whenever the shopper moves to another category or search.
    effect(() => {
      const category = this.category();
      const sub = this.subCategory();
      this.searchTerm();

      untracked(() => {
        this.selectedBrands.set([]);
        this.page.set(1);
        this.loadFilterOptions(category, sub);
      });
    });

    effect(() => {
      const criteria = {
        category: this.category(),
        subCategory: this.subCategory(),
        search: this.searchTerm(),
        brands: this.selectedBrands(),
        model: this.filterModel(),
        page: this.page(),
      };

      untracked(() => this.scheduleLoad(criteria));
    });
  }

  protected toggleBrand(brand: string): void {
    this.page.set(1);
    this.selectedBrands.update((brands) =>
      brands.includes(brand) ? brands.filter((item) => item !== brand) : [...brands, brand]
    );
  }

  protected isBrandSelected(brand: string): boolean {
    return this.selectedBrands().includes(brand);
  }

  protected resetFilters(): void {
    const bounds = this.priceBounds();
    this.selectedBrands.set([]);
    this.filterModel.set({
      minPrice: bounds.min,
      maxPrice: bounds.max,
      sort: 'newest',
      inStockOnly: false,
    });
    this.page.set(1);
  }

  protected changeSort(value: string): void {
    this.page.set(1);
    this.filterModel.update((model) => ({ ...model, sort: value as SortOption }));
  }

  protected toggleStockOnly(): void {
    this.page.set(1);
    this.filterModel.update((model) => ({ ...model, inStockOnly: !model.inStockOnly }));
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );

  protected selectSubCategory(sub: SubCategory | null): void {
    const category = this.category();
    if (!category) return;

    this.router.navigate(['/category', category], {
      queryParams: sub ? { sub } : {},
    });
  }

  private loadFilterOptions(category: Category | null, sub: SubCategory | null): void {
    this.productService.filterOptions(category ?? '', sub ?? '').subscribe((options) => {
      this.availableBrands.set(options.brands);
      this.priceBounds.set({ min: options.minPrice, max: options.maxPrice });
      this.filterModel.update((model) => ({
        ...model,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
      }));
    });
  }

  private scheduleLoad(criteria: {
    category: Category | null;
    subCategory: SubCategory | null;
    search: string;
    brands: string[];
    model: FilterModel;
    page: number;
  }): void {
    if (this.debounceId) clearTimeout(this.debounceId);

    this.loading.set(true);
    this.debounceId = setTimeout(() => this.load(criteria), 260);
  }

  private load(criteria: {
    category: Category | null;
    subCategory: SubCategory | null;
    search: string;
    brands: string[];
    model: FilterModel;
    page: number;
  }): void {
    if (this.priceRangeInvalid()) {
      this.loading.set(false);
      return;
    }

    this.productService
      .list({
        category: criteria.category ?? '',
        subCategory: criteria.subCategory ?? '',
        search: criteria.search,
        brand: criteria.brands,
        minPrice: criteria.model.minPrice || null,
        maxPrice: criteria.model.maxPrice || null,
        sort: criteria.model.sort,
        page: criteria.page,
        limit: 12,
      })
      .subscribe({
        next: (response) => {
          const list = criteria.model.inStockOnly
            ? response.data.products.filter((product) => product.inStock)
            : response.data.products;

          this.products.set(list);
          this.total.set(response.total);
          this.totalPages.set(response.pages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
