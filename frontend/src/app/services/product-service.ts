import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ENDPOINTS } from '../constants/api-constants';
import {
  FilterOptions,
  FilterOptionsResponse,
  Product,
  ProductListResponse,
  ProductQuery,
  ProductResponse,
  ProductsResponse,
} from '../interfaces/product-interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list(query: ProductQuery): Observable<ProductListResponse> {
    let params = new HttpParams();

    if (query.category) params = params.set('category', query.category);
    if (query.subCategory) params = params.set('subCategory', query.subCategory);
    if (query.brand?.length) params = params.set('brand', query.brand.join(','));
    if (query.minPrice != null) params = params.set('minPrice', query.minPrice);
    if (query.maxPrice != null) params = params.set('maxPrice', query.maxPrice);
    if (query.search) params = params.set('search', query.search);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http.get<ProductListResponse>(ENDPOINTS.products, { params });
  }

  bestSellers(limit = 8): Observable<Product[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http
      .get<ProductsResponse>(ENDPOINTS.bestSellers, { params })
      .pipe(map((response) => response.data.products));
  }

  filterOptions(category?: string, subCategory?: string): Observable<FilterOptions> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (subCategory) params = params.set('subCategory', subCategory);

    return this.http
      .get<FilterOptionsResponse>(ENDPOINTS.filters, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Product> {
    return this.http
      .get<ProductResponse>(`${ENDPOINTS.products}/${id}`)
      .pipe(map((response) => response.data.product));
  }

  related(id: string): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(`${ENDPOINTS.products}/${id}/related`)
      .pipe(map((response) => response.data.products));
  }

  create(data: FormData): Observable<Product> {
    return this.http
      .post<ProductResponse>(ENDPOINTS.products, data)
      .pipe(map((response) => response.data.product));
  }

  update(id: string, data: FormData): Observable<Product> {
    return this.http
      .patch<ProductResponse>(`${ENDPOINTS.products}/${id}`, data)
      .pipe(map((response) => response.data.product));
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${ENDPOINTS.products}/${id}`);
  }

  imageUrl(fileName: string): string {
    return `${ENDPOINTS.uploads}/products/${fileName}`;
  }
}
