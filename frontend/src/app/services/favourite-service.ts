import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { ENDPOINTS } from '../constants/api-constants';
import { Product } from '../interfaces/product-interface';
import { FavouritesResponse } from '../interfaces/user-interface';
import { ToastService } from './toast-service';

@Injectable({ providedIn: 'root' })
export class FavouriteService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  private readonly favouriteProducts = signal<Product[]>([]);
  private readonly busy = signal(false);

  readonly products = this.favouriteProducts.asReadonly();
  readonly isBusy = this.busy.asReadonly();
  readonly count = computed(() => this.favouriteProducts().length);
  private readonly ids = computed(
    () => new Set(this.favouriteProducts().map((product) => product._id))
  );

  load(): void {
    this.busy.set(true);
    this.http.get<FavouritesResponse>(ENDPOINTS.favourites).subscribe({
      next: (response) => {
        this.favouriteProducts.set(response.data.products);
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  toggle(productId: string): void {
    this.busy.set(true);
    this.http
      .post<FavouritesResponse>(`${ENDPOINTS.favourites}/${productId}`, {})
      .subscribe({
        next: (response) => {
          this.favouriteProducts.set(response.data.products);
          this.busy.set(false);
          this.toast.success(
            response.isFavourite ? 'Saved to favourites' : 'Removed from favourites'
          );
        },
        error: () => this.busy.set(false),
      });
  }

  isFavourite(productId: string): boolean {
    return this.ids().has(productId);
  }

  clear(): void {
    this.favouriteProducts.set([]);
  }
}
