import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('en-EG', {
  maximumFractionDigits: 0,
});

@Pipe({ name: 'egp' })
export class EgpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return `EGP ${formatter.format(value)}`;
  }
}
