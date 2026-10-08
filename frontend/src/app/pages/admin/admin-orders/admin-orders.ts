import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ORDER_STATUSES } from '../../../constants/api-constants';
import { Order, OrderStatus } from '../../../interfaces/order-interface';
import { OrderService } from '../../../services/order-service';
import { ToastService } from '../../../services/toast-service';
import { EgpPipe } from '../../../components/egp-pipe';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, EgpPipe, DatePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  protected readonly statuses = ORDER_STATUSES;
  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly updatingId = signal<string | null>(null);
  protected readonly statusFilter = signal<string>('');

  protected readonly filtered = computed(() => {
    const status = this.statusFilter();
    return status ? this.orders().filter((order) => order.status === status) : this.orders();
  });

  protected readonly revenue = computed(() =>
    this.filtered()
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalPrice, 0)
  );

  constructor() {
    this.orderService.allOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected customer(order: Order): { name: string; email: string } {
    if (typeof order.user === 'string') {
      return { name: 'Deleted user', email: '—' };
    }
    return {
      name: `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
    };
  }

  protected changeStatus(order: Order, status: string): void {
    if (status === order.status) return;

    this.updatingId.set(order._id);

    this.orderService.updateStatus(order._id, status as OrderStatus).subscribe({
      next: (updated) => {
        this.orders.update((list) =>
          list.map((item) => (item._id === updated._id ? updated : item))
        );
        this.updatingId.set(null);
        this.toast.success(`Order marked as ${status}`);
      },
      error: () => this.updatingId.set(null),
    });
  }

  protected setFilter(status: string): void {
    this.statusFilter.set(status);
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
