import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth-service';
import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;

  protected readonly links = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const },
    { path: 'products', label: 'Products', icon: 'package' as const },
    { path: 'orders', label: 'Orders', icon: 'clipboard' as const },
  ];
}
