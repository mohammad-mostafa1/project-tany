import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isAdmin()) return true;

  if (!auth.isLoggedIn()) {
    toast.info('Sign in with an admin account to continue');
    return router.createUrlTree(['/signin'], {
      queryParams: { returnUrl: state.url },
    });
  }

  toast.error('Admins only — this area is not available for customers');
  return router.createUrlTree(['/']);
};
