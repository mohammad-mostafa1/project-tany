import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  inject(ToastService).info('Please sign in to continue');
  return router.createUrlTree(['/signin'], {
    queryParams: { returnUrl: state.url },
  });
};
