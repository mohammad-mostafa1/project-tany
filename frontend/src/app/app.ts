import { Component, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { ToastHost } from './components/toast-host/toast-host';
import { AuthService } from './services/auth-service';
import { CartService } from './services/cart-service';
import { FavouriteService } from './services/favourite-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly favourites = inject(FavouriteService);

  constructor() {
    // Cart and favourites live on the server, so they reload whenever the customer changes.
    effect(() => {
      const user = this.auth.user();

      untracked(() => {
        if (user?.role === 'customer') {
          this.cart.load();
          this.favourites.load();
        } else {
          this.cart.clear();
          this.favourites.clear();
        }
      });
    });
  }
}
