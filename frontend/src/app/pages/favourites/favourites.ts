import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FavouriteService } from '../../services/favourite-service';
import { Icon } from '../../components/icon/icon';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-favourites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard, Icon],
  templateUrl: './favourites.html',
})
export class Favourites {
  private readonly favourites = inject(FavouriteService);

  protected readonly products = this.favourites.products;
  protected readonly count = this.favourites.count;
  protected readonly loading = this.favourites.isBusy;
}
