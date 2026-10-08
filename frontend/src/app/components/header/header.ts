import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { CATEGORIES } from '../../constants/api-constants';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { FavouriteService } from '../../services/favourite-service';
import { ThemeService } from '../../services/theme-service';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule, Icon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly favourites = inject(FavouriteService);

  protected readonly categories = CATEGORIES;
  protected readonly currentTheme = this.theme.theme;
  protected readonly user = this.auth.user;
  protected readonly isLoggedIn = this.auth.isLoggedIn;
  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly isCustomer = this.auth.isCustomer;
  protected readonly initials = this.auth.initials;
  protected readonly cartCount = this.cart.count;
  protected readonly favouriteCount = this.favourites.count;

  // Two-way bound to the search box with [(ngModel)].
  protected searchTerm = '';
  protected readonly menuOpen = signal(false);
  protected readonly accountOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menuOpen.set(false);
        this.accountOpen.set(false);
      });
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected toggleAccount(): void {
    this.accountOpen.update((open) => !open);
  }

  protected search(): void {
    const term = this.searchTerm.trim();
    if (!term) return;

    // Router service navigation with query params (vs. the routerLink navigation in the template).
    this.router.navigate(['/search'], { queryParams: { q: term } });
  }

  protected logout(): void {
    this.cart.clear();
    this.favourites.clear();
    this.auth.logout();
  }
}
