import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Order } from '../../../interfaces/order-interface';
import { Product } from '../../../interfaces/product-interface';
import { OrderService } from '../../../services/order-service';
import { ProductService } from '../../../services/product-service';
import { EgpPipe } from '../../../components/egp-pipe';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, EgpPipe, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);

  protected readonly products = signal<Product[]>([]);
  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);

  protected readonly revenue = computed(() =>
    this.orders()
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalPrice, 0)
  );
  protected readonly pendingCount = computed(
    () => this.orders().filter((order) => order.status === 'pending').length
  );
  protected readonly lowStock = computed(() =>
    this.products()
      .filter((product) => product.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6)
  );
  protected readonly topSellers = computed(() =>
    [...this.products()].sort((a, b) => b.sold - a.sold).slice(0, 5)
  );
  protected readonly recentOrders = computed(() => this.orders().slice(0, 5));

  protected readonly categoryBreakdown = computed(() => {
    const totals = new Map<string, number>();
    for (const product of this.products()) {
      totals.set(product.category, (totals.get(product.category) ?? 0) + 1);
    }
    const all = this.products().length || 1;
    return [...totals.entries()].map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / all) * 100),
    }));
  });

  constructor() {
    this.productService.list({ limit: 100 }).subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.orderService.allOrders().subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.orders.set([]),
    });
  }

  protected image(fileName: string): string {
    return this.productService.imageUrl(fileName);
  }

  protected customerName(order: Order): string {
    return typeof order.user === 'string'
      ? 'Customer'
      : `${order.user.firstName} ${order.user.lastName}`;
  }
}
