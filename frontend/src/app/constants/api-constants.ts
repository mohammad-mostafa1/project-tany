import { Category, SortOption, SubCategory } from '../interfaces/product-interface';

export const API_BASE_URL = 'http://localhost:5000/api/v1';

export const ENDPOINTS = {
  signup: `${API_BASE_URL}/auth/signup`,
  signin: `${API_BASE_URL}/auth/signin`,
  me: `${API_BASE_URL}/auth/me`,
  products: `${API_BASE_URL}/products`,
  bestSellers: `${API_BASE_URL}/products/best-sellers`,
  filters: `${API_BASE_URL}/products/filters`,
  favourites: `${API_BASE_URL}/users/favourites`,
  cart: `${API_BASE_URL}/users/cart`,
  profile: `${API_BASE_URL}/users/profile`,
  users: `${API_BASE_URL}/users`,
  orders: `${API_BASE_URL}/orders`,
  allOrders: `${API_BASE_URL}/orders/all`,
  uploads: `${API_BASE_URL}/uploads`,
} as const;

export const TOKEN_KEY = 'voltedge-token';
export const THEME_KEY = 'voltedge-theme';

export interface CategoryMeta {
  slug: Category;
  label: string;
  tagline: string;
  subCategories: { slug: SubCategory; label: string }[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'mobiles',
    label: 'Mobiles',
    tagline: 'Flagships and everyday phones from Apple, Samsung, Xiaomi and more.',
    subCategories: [],
  },
  {
    slug: 'laptops',
    label: 'Laptops',
    tagline: 'Gaming rigs, ultrabooks and workstations built for real workloads.',
    subCategories: [],
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    tagline: 'Headphones, keyboards and mice that finish the setup.',
    subCategories: [
      { slug: 'headphones', label: 'Headphones' },
      { slug: 'keyboards', label: 'Keyboards' },
      { slug: 'mice', label: 'Mice' },
    ],
  },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;
