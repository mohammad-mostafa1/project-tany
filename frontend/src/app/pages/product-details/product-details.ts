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
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Product } from '../../interfaces/product-interface';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { FavouriteService } from '../../services/favourite-service';
import { ProductService } from '../../services/product-service';
import { ToastService } from '../../services/toast-service';
import { EgpPipe } from '../../components/egp-pipe';
import { Icon } from '../../components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';
import { StarRating } from '../../components/star-rating/star-rating';

@Component({
  selector: 'app-product-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, StarRating, ProductCard, EgpPipe, TitleCasePipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly favourites = inject(FavouriteService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });

  protected readonly product = signal<Product | null>(null);
  protected readonly related = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly quantity = signal(1);

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly cartBusy = this.cart.isBusy;

  protected readonly image = computed(() => {
    const product = this.product();
    return product ? this.productService.imageUrl(product.imageUrl) : '';
  });
  protected readonly isFavourite = computed(() => {
    const product = this.product();
    return product ? this.favourites.isFavourite(product._id) : false;
  });
  protected readonly inCartQuantity = computed(() => {
    const product = this.product();
    return product ? this.cart.quantityOf(product._id) : 0;
  });
  protected readonly savings = computed(() => {
    const product = this.product();
    if (!product?.oldPrice) return 0;
    return product.oldPrice - product.price;
  });

  constructor() {
    effect(() => {
      const id = this.params().get('id');
      untracked(() => {
        if (id) this.load(id);
      });
    });
  }

  protected changeQuantity(delta: number): void {
    const stock = this.product()?.stock ?? 1;
    this.quantity.update((value) => Math.min(Math.max(value + delta, 1), Math.max(stock, 1)));
  }

  protected addToCart(): void {
    const product = this.product();
    if (!product || !this.requireCustomer()) return;

    this.cart.add(product._id, this.quantity());
  }

  protected buyNow(): void {
    const product = this.product();
    if (!product || !this.requireCustomer()) return;

    this.cart.add(product._id, this.quantity());
    this.router.navigateByUrl('/checkout');
  }

  protected toggleFavourite(): void {
    const product = this.product();
    if (!product || !this.requireCustomer()) return;

    this.favourites.toggle(product._id);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.quantity.set(1);

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });

    this.productService.related(id).subscribe({
      next: (products) => this.related.set(products),
      error: () => this.related.set([]),
    });
  }

  private requireCustomer(): boolean {
    if (this.auth.isCustomer()) return true;

    if (!this.auth.isLoggedIn()) {
      this.toast.info('Sign in to save and buy products');
      this.router.navigate(['/signin'], {
        queryParams: { returnUrl: this.router.url },
      });
      return false;
    }

    this.toast.info('Admin accounts cannot shop — use a customer account');
    return false;
  }
}
