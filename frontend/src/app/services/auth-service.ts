import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

import { ENDPOINTS, TOKEN_KEY } from '../constants/api-constants';
import {
  AuthResponse,
  SigninData,
  SignupData,
  User,
  UserResponse,
} from '../interfaces/user-interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUser = signal<User | null>(null);
  private readonly loadingUser = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isLoading = this.loadingUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isCustomer = computed(() => this.currentUser()?.role === 'customer');
  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  });

  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  signup(data: SignupData | FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(ENDPOINTS.signup, data)
      .pipe(tap((response) => this.storeSession(response)));
  }

  signin(data: SigninData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(ENDPOINTS.signin, data)
      .pipe(tap((response) => this.storeSession(response)));
  }

  // Runs as an app initializer: guards must not evaluate before the session is known,
  // otherwise refreshing on /cart or /admin bounces a signed-in user to /signin.
  restoreSession(): Observable<unknown> {
    if (!this.token) return of(null);

    this.loadingUser.set(true);
    return this.http.get<UserResponse>(ENDPOINTS.me).pipe(
      tap((response) => {
        this.currentUser.set(response.data.user);
        this.loadingUser.set(false);
      }),
      catchError(() => {
        this.clearSession();
        this.loadingUser.set(false);
        return of(null);
      })
    );
  }

  setUser(user: User): void {
    this.currentUser.set(user);
  }

  logout(): void {
    this.clearSession();
    this.router.navigateByUrl('/');
  }

  clearSession(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    this.currentUser.set(null);
  }

  private storeSession(response: AuthResponse): void {
    try {
      localStorage.setItem(TOKEN_KEY, response.token);
    } catch {
      // ignore
    }
    this.currentUser.set(response.data.user);
  }
}
