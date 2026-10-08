import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CATEGORIES } from '../../constants/api-constants';
import { Product } from '../../interfaces/product-interface';
import { ProductService } from '../../services/product-service';
import { EgpPipe } from '../../components/egp-pipe';
import { Icon, IconName } from '../../components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard, Icon, EgpPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly bestSellers = signal<Product[]>([]);
  protected readonly deals = signal<Product[]>([]);
  protected readonly newArrivals = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly skeletons = Array.from({ length: 8 });

  // A cheap mouse can top the sales chart; the hero looks better with a phone or laptop.
  protected readonly hero = computed(
    () =>
      this.bestSellers().find((product) => product.category !== 'accessories') ??
      this.bestSellers()[0] ??
      null
  );
  protected readonly heroImage = computed(() => {
    const product = this.hero();
    return product ? this.productService.imageUrl(product.imageUrl) : '';
  });

  protected readonly categoryIcons: Record<string, IconName> = {
    mobiles: 'phone',
    laptops: 'laptop',
    accessories: 'headphones',
  };

  constructor() {
    this.productService.bestSellers(8).subscribe({
      next: (products) => {
        this.bestSellers.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.productService
      .list({ sort: 'price-desc', limit: 4 })
      .subscribe((response) => this.newArrivals.set(response.data.products));

    this.productService
      .list({ sort: 'rating', limit: 4 })
      .subscribe((response) => this.deals.set(response.data.products));
  }

  // Router service navigation (navigate) alongside the routerLink usage in the template.
  protected openHero(): void {
    const product = this.hero();
    if (product) this.router.navigate(['/product', product._id]);
  }

  protected browse(category: string): void {
    this.router.navigateByUrl(`/category/${category}`);
  }
}
