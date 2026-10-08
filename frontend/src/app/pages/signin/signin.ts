import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SigninData } from '../../interfaces/user-interface';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';
import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-signin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  // Template-driven form: the model is a plain object bound with [(ngModel)].
  protected credentials: SigninData = { email: '', password: '' };

  protected readonly submitting = signal(false);
  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((shown) => !shown);
  }

  protected submit(signinForm: NgForm): void {
    if (signinForm.invalid) {
      signinForm.control.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.auth.signin(this.credentials).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.toast.success(`Welcome back, ${response.data.user.firstName}!`);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        this.router.navigate([response.data.user.role === 'admin' ? '/admin' : '/']);
      },
      error: () => this.submitting.set(false),
    });
  }
}
