import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

import { ENDPOINTS } from '../constants/api-constants';
import { CartItem, CartResponse } from '../interfaces/user-interface';
import { ToastService } from './toast-service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  private readonly cartItems = signal<CartItem[]>([]);
  private readonly busy = signal(false);

  readonly items = this.cartItems.asReadonly();
  readonly isBusy = this.busy.asReadonly();
  readonly count = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );
  readonly shipping = computed(() => (this.subtotal() > 20000 || this.subtotal() === 0 ? 0 : 75));
  readonly total = computed(() => this.subtotal() + this.shipping());

  load(): void {
    this.busy.set(true);
    this.http.get<CartResponse>(ENDPOINTS.cart).subscribe({
      next: (response) => {
        this.cartItems.set(response.data.items);
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  add(productId: string, quantity = 1): void {
    this.busy.set(true);
    this.http
      .post<CartResponse>(ENDPOINTS.cart, { productId, quantity })
      .pipe(tap(() => this.busy.set(false)))
      .subscribe({
        next: (response) => {
          this.cartItems.set(response.data.items);
          this.toast.success('Added to your cart');
        },
        error: () => this.busy.set(false),
      });
  }

  updateQuantity(productId: string, quantity: number): void {
    this.busy.set(true);
    this.http
      .patch<CartResponse>(`${ENDPOINTS.cart}/${productId}`, { quantity })
      .subscribe({
        next: (response) => {
          this.cartItems.set(response.data.items);
          this.busy.set(false);
        },
        error: () => this.busy.set(false),
      });
  }

  remove(productId: string): void {
    this.busy.set(true);
    this.http.delete<CartResponse>(`${ENDPOINTS.cart}/${productId}`).subscribe({
      next: (response) => {
        this.cartItems.set(response.data.items);
        this.busy.set(false);
        this.toast.info('Removed from your cart');
      },
      error: () => this.busy.set(false),
    });
  }

  quantityOf(productId: string): number {
    return this.cartItems().find((item) => item.product._id === productId)?.quantity ?? 0;
  }

  clear(): void {
    this.cartItems.set([]);
  }
}
