import { Component, input } from '@angular/core';

@Component({
  selector: 'tooltip',
  standalone: true,
  styleUrl: './tooltip.scss',
  templateUrl: './tooltip.html',
  host: {
    role: 'tooltip',
    '[class]': "'position-' + position()",
    '[innerHtml]': 'text()',
  },
})
export class Tooltip {
  text = input('');
  position = input<'top' | 'bottom' | 'right' | 'left'>('top');
}
