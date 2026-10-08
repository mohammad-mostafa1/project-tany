import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ENDPOINTS } from '../constants/api-constants';
import {
  CheckoutData,
  Order,
  OrderResponse,
  OrderStatus,
  OrdersResponse,
} from '../interfaces/order-interface';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  checkout(data: CheckoutData): Observable<Order> {
    return this.http
      .post<OrderResponse>(ENDPOINTS.orders, data)
      .pipe(map((response) => response.data.order));
  }

  myOrders(): Observable<Order[]> {
    return this.http
      .get<OrdersResponse>(ENDPOINTS.orders)
      .pipe(map((response) => response.data.orders));
  }

  allOrders(): Observable<Order[]> {
    return this.http
      .get<OrdersResponse>(ENDPOINTS.allOrders)
      .pipe(map((response) => response.data.orders));
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http
      .patch<OrderResponse>(`${ENDPOINTS.orders}/${id}/status`, { status })
      .pipe(map((response) => response.data.order));
  }
}
