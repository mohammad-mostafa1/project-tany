import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartItem } from '../../interfaces/user-interface';
import { CartService } from '../../services/cart-service';
import { ProductService } from '../../services/product-service';
import { EgpPipe } from '../../components/egp-pipe';
import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, EgpPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly cart = inject(CartService);
  private readonly productService = inject(ProductService);

  protected readonly items = this.cart.items;
  protected readonly count = this.cart.count;
  protected readonly subtotal = this.cart.subtotal;
  protected readonly shipping = this.cart.shipping;
  protected readonly total = this.cart.total;
  protected readonly busy = this.cart.isBusy;

  protected image(item: CartItem): string {
    return this.productService.imageUrl(item.product.imageUrl);
  }

  protected increase(item: CartItem): void {
    if (item.quantity >= item.product.stock) return;
    this.cart.updateQuantity(item.product._id, item.quantity + 1);
  }

  protected decrease(item: CartItem): void {
    if (item.quantity <= 1) return;
    this.cart.updateQuantity(item.product._id, item.quantity - 1);
  }

  protected remove(item: CartItem): void {
    this.cart.remove(item.product._id);
  }
}
