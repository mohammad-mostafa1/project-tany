export type Category = 'mobiles' | 'laptops' | 'accessories';
export type SubCategory = 'headphones' | 'keyboards' | 'mice';

export interface Spec {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: Category;
  subCategory: SubCategory | null;
  description: string;
  specs: Spec[];
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  stock: number;
  rating: number;
  sold: number;
  isFeatured: boolean;
  discountPercentage: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  category?: Category | '';
  subCategory?: SubCategory | '';
  brand?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'best-selling';

export interface ProductListResponse {
  status: string;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: { products: Product[] };
}

export interface ProductResponse {
  status: string;
  data: { product: Product };
}

export interface ProductsResponse {
  status: string;
  count: number;
  data: { products: Product[] };
}

export interface FilterOptions {
  brands: string[];
  minPrice: number;
  maxPrice: number;
}

export interface FilterOptionsResponse {
  status: string;
  data: FilterOptions;
}
