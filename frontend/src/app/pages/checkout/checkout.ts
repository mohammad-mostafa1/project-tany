import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CheckoutData } from '../../interfaces/order-interface';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { OrderService } from '../../services/order-service';
import { ProductService } from '../../services/product-service';
import { ToastService } from '../../services/toast-service';
import { EgpPipe } from '../../components/egp-pipe';
import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon, EgpPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly items = this.cart.items;
  protected readonly subtotal = this.cart.subtotal;
  protected readonly shipping = this.cart.shipping;
  protected readonly total = this.cart.total;
  protected readonly submitting = signal(false);

  protected readonly checkoutForm = this.fb.nonNullable.group({
    shippingAddress: [
      this.auth.user()?.address ?? '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(200)],
    ],
    phone: [
      this.auth.user()?.phone ?? '',
      [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)],
    ],
    paymentMethod: ['cash' as 'cash' | 'card', [Validators.required]],
  });

  protected control(name: string): AbstractControl {
    return this.checkoutForm.get(name)!;
  }

  protected showError(name: string): boolean {
    const control = this.control(name);
    return control.invalid && (control.touched || control.dirty);
  }

  protected image(fileName: string): string {
    return this.productService.imageUrl(fileName);
  }

  protected selectPayment(method: 'cash' | 'card'): void {
    this.checkoutForm.controls.paymentMethod.setValue(method);
  }

  protected placeOrder(): void {
    if (this.items().length === 0) {
      this.toast.error('Your cart is empty');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toast.error('Please complete the delivery details');
      return;
    }

    this.submitting.set(true);

    this.orders.checkout(this.checkoutForm.getRawValue() as CheckoutData).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.cart.clear();
        this.toast.success(`Order placed — ${order.items.length} item(s) on the way!`);
        this.router.navigateByUrl('/orders');
      },
      error: () => this.submitting.set(false),
    });
  }
}
