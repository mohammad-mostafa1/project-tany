import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CATEGORIES } from '../../../constants/api-constants';
import { Product } from '../../../interfaces/product-interface';
import { ProductService } from '../../../services/product-service';
import { ToastService } from '../../../services/toast-service';
import { EgpPipe } from '../../../components/egp-pipe';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, Icon, EgpPipe],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  protected readonly categories = CATEGORIES;
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly deleting = signal<string | null>(null);
  protected readonly confirmingId = signal<string | null>(null);

  protected search = '';
  protected readonly searchTerm = signal('');
  protected readonly categoryFilter = signal<string>('');

  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();

    return this.products().filter((product) => {
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term);
      const matchesCategory = !category || product.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  constructor() {
    this.load();
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected onCategoryChange(value: string): void {
    this.categoryFilter.set(value);
  }

  protected image(fileName: string): string {
    return this.productService.imageUrl(fileName);
  }

  protected askDelete(id: string): void {
    this.confirmingId.set(id);
  }

  protected cancelDelete(): void {
    this.confirmingId.set(null);
  }

  protected confirmDelete(product: Product): void {
    this.deleting.set(product._id);

    this.productService.remove(product._id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((item) => item._id !== product._id));
        this.deleting.set(null);
        this.confirmingId.set(null);
        this.toast.success(`"${product.name}" was deleted`);
      },
      error: () => {
        this.deleting.set(null);
        this.confirmingId.set(null);
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.productService.list({ limit: 100 }).subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
