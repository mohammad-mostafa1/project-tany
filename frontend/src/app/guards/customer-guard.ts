import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';

// Cart, favourites and checkout belong to customers — an admin has no cart on the server.
export const customerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isCustomer()) return true;

  if (!auth.isLoggedIn()) {
    toast.info('Please sign in to continue');
    return router.createUrlTree(['/signin'], {
      queryParams: { returnUrl: state.url },
    });
  }

  toast.info('Admin accounts cannot shop — use a customer account');
  return router.createUrlTree(['/admin']);
};
