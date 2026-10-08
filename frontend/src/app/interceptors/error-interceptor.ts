import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ENDPOINTS } from '../constants/api-constants';
import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = error.error?.message ?? 'Something went wrong. Please try again.';

      if (error.status === 0) {
        message = 'Cannot reach the server. Is the API running on port 5000?';
      }

      if (error.status === 401) {
        // The boot-time session check handles its own cleanup — redirecting there would
        // throw every visitor with a stale token onto the sign-in page.
        if (req.url === ENDPOINTS.me) {
          return throwError(() => error);
        }

        // An expired or tampered token should not leave a half-signed-in UI behind.
        if (auth.token) {
          auth.clearSession();
          router.navigate(['/signin']);
          message = 'Your session expired. Please sign in again.';
        }
      }

      if (error.status === 403) {
        message = 'You do not have permission to do that.';
      }

      toast.error(message);
      return throwError(() => error);
    })
  );
};
