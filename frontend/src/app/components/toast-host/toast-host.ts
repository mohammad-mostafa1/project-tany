import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService, ToastType } from '../../services/toast-service';
import { Icon, IconName } from '../icon/icon';

const ICONS: Record<ToastType, IconName> = {
  success: 'check-circle',
  error: 'alert',
  info: 'info',
};

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="toast-host" role="status" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class]="toast.type">
          <app-icon [name]="icon(toast.type)" [size]="20" />
          <span>{{ toast.message }}</span>
          <button type="button" (click)="dismiss(toast.id)" aria-label="Dismiss notification">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-host.css',
})
export class ToastHost {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected icon(type: ToastType): IconName {
    return ICONS[type];
  }

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
