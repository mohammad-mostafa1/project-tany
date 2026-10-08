import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';

import { ENDPOINTS } from '../../constants/api-constants';
import { UserResponse } from '../../interfaces/user-interface';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';
import { Icon } from '../../components/icon/icon';

interface ProfileModel {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

@Component({
  selector: 'app-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, RouterLink, Icon],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  protected readonly user = this.auth.user;
  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly initials = this.auth.initials;
  protected readonly saving = signal(false);

  // Signal Forms again — this time for the profile editor.
  protected readonly profileModel = signal<ProfileModel>({
    firstName: this.auth.user()?.firstName ?? '',
    lastName: this.auth.user()?.lastName ?? '',
    phone: this.auth.user()?.phone ?? '',
    address: this.auth.user()?.address ?? '',
  });

  protected readonly profileForm = form(this.profileModel, (path) => {
    required(path.firstName, { message: 'First name is required' });
    minLength(path.firstName, 2, { message: 'Use at least 2 characters' });
    maxLength(path.firstName, 50, { message: 'Keep it under 50 characters' });

    required(path.lastName, { message: 'Last name is required' });
    minLength(path.lastName, 2, { message: 'Use at least 2 characters' });
    maxLength(path.lastName, 50, { message: 'Keep it under 50 characters' });

    pattern(path.phone, /^\+?[0-9]{10,15}$/, {
      message: 'Enter 10 to 15 digits, e.g. 01000000000',
    });

    maxLength(path.address, 200, { message: 'Keep the address under 200 characters' });
  });

  protected save(): void {
    if (this.profileForm().invalid()) {
      this.profileForm().markAsTouched();
      this.toast.error('Please fix the highlighted fields');
      return;
    }

    this.saving.set(true);

    this.http
      .patch<UserResponse>(ENDPOINTS.profile, this.profileModel())
      .subscribe({
        next: (response) => {
          this.auth.setUser(response.data.user);
          this.saving.set(false);
          this.toast.success('Profile updated');
        },
        error: () => this.saving.set(false),
      });
  }

  protected logout(): void {
    this.auth.logout();
  }
}
