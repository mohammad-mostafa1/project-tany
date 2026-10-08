import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <span class="stars" [attr.aria-label]="'Rated ' + rating() + ' out of 5'" role="img">
      @for (star of stars(); track $index) {
        <app-icon
          name="star"
          [size]="size()"
          [filled]="star"
          [class.dim]="!star"
          [strokeWidth]="1.5"
        />
      }
    </span>
    @if (showValue()) {
      <span class="value">{{ rating().toFixed(1) }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .stars {
        display: inline-flex;
        gap: 1px;
        color: var(--star);
      }

      .dim {
        color: var(--border-strong);
      }

      .value {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-muted);
      }
    `,
  ],
})
export class StarRating {
  readonly rating = input.required<number>();
  readonly size = input(14);
  readonly showValue = input(true);

  protected readonly stars = computed(() => {
    const rounded = Math.round(this.rating());
    return Array.from({ length: 5 }, (_, index) => index < rounded);
  });
}
