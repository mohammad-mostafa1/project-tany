import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CATEGORIES } from '../../constants/api-constants';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly categories = CATEGORIES;
  protected readonly year = new Date().getFullYear();

  protected readonly promises = [
    {
      icon: 'truck' as const,
      title: 'Free delivery over EGP 20,000',
      text: 'Cairo and Giza within 24 hours.',
    },
    {
      icon: 'shield' as const,
      title: 'Official warranty',
      text: 'Every device is agent-backed.',
    },
    {
      icon: 'refresh' as const,
      title: '14-day returns',
      text: 'Changed your mind? Send it back.',
    },
    {
      icon: 'wallet' as const,
      title: 'Cash on delivery',
      text: 'Pay when the box is in your hands.',
    },
  ];
}
