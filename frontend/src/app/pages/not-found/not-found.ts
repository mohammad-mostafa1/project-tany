import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="container page">
      <div class="empty-state card not-found animate-in">
        <span class="code">404</span>
        <h1>This page took a wrong turn</h1>
        <p>The link may be old, or the product was removed from the catalogue.</p>
        <div class="actions">
          <a class="btn btn-primary" routerLink="/">
            <app-icon name="chevron-left" [size]="18" /> Back to home
          </a>
          <button type="button" class="btn btn-outline" (click)="browse()">
            Browse mobiles
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found {
        padding: var(--space-8) var(--space-5);
      }

      .code {
        font-family: var(--font-heading);
        font-size: clamp(3.5rem, 2rem + 7vw, 6rem);
        font-weight: 800;
        line-height: 1;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      h1 {
        font-size: 1.5rem;
      }

      .actions {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
        justify-content: center;
        margin-top: var(--space-3);
      }
    `,
  ],
})
export class NotFound {
  private readonly router = inject(Router);

  protected browse(): void {
    this.router.navigateByUrl('/category/mobiles');
  }
}
