import { Product } from './product-interface';

export type Role = 'customer' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  imageUrl: string;
  favourites: string[];
  createdAt: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: { user: User };
}

export interface UserResponse {
  status: string;
  data: { user: User };
}

export interface UsersResponse {
  status: string;
  count: number;
  data: { users: User[] };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartResponse {
  status: string;
  count: number;
  data: { items: CartItem[] };
}

export interface FavouritesResponse {
  status: string;
  count: number;
  isFavourite?: boolean;
  data: { products: Product[] };
}
