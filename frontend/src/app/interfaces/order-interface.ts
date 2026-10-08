export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface OrderUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Order {
  _id: string;
  user: string | OrderUser;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  paymentMethod: 'cash' | 'card';
  status: OrderStatus;
  createdAt: string;
}

export interface CheckoutData {
  shippingAddress: string;
  phone: string;
  paymentMethod: 'cash' | 'card';
}

export interface OrderResponse {
  status: string;
  data: { order: Order };
}

export interface OrdersResponse {
  status: string;
  count: number;
  data: { orders: Order[] };
}
