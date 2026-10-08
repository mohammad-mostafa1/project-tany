import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../interfaces/product-interface';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { FavouriteService } from '../../services/favourite-service';
import { ProductService } from '../../services/product-service';
import { ToastService } from '../../services/toast-service';
import { EgpPipe } from '../egp-pipe';
import { Icon } from '../icon/icon';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, StarRating, EgpPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly favourites = inject(FavouriteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly product = input.required<Product>();

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly image = computed(() =>
    this.productService.imageUrl(this.product().imageUrl)
  );
  protected readonly isFavourite = computed(() =>
    this.favourites.isFavourite(this.product()._id)
  );
  protected readonly inCart = computed(() => this.cart.quantityOf(this.product()._id) > 0);

  protected toggleFavourite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.requireCustomer()) return;
    this.favourites.toggle(this.product()._id);
  }

  protected addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.requireCustomer()) return;
    this.cart.add(this.product()._id, 1);
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
