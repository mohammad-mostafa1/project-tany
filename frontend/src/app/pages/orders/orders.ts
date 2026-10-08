import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Order } from '../../interfaces/order-interface';
import { OrderService } from '../../services/order-service';
import { ProductService } from '../../services/product-service';
import { EgpPipe } from '../../components/egp-pipe';
import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, EgpPipe, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.orderService.myOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected image(fileName: string): string {
    return this.productService.imageUrl(fileName);
  }

  protected statusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      case 'pending':
        return 'badge-neutral';
      default:
        return 'badge-primary';
    }
  }
}
