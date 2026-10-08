import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';
import { Icon } from '../../components/icon/icon';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);

  // Reactive (typed) form.
  protected readonly signupForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

  protected control(name: string): AbstractControl {
    return this.signupForm.get(name)!;
  }

  protected showError(name: string): boolean {
    const control = this.control(name);
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields');
      return;
    }

    const { confirmPassword, ...data } = this.signupForm.getRawValue();
    this.submitting.set(true);

    this.auth.signup(data).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.toast.success(`Welcome to VoltEdge, ${response.data.user.firstName}!`);
        this.router.navigateByUrl('/');
      },
      error: () => this.submitting.set(false),
    });
  }
}
