import { Component, input } from '@angular/core';
import { TooltipPosition } from '../common/TooltipEnable.js';

@Component({
  selector: 'tooltip',
  standalone: true,
  styleUrl: './tooltip.scss',
  templateUrl: './tooltip.html',
  host: {
    role: 'tooltip',
    '[class]': "'position-' + position()",
  },
})
export class Tooltip {
  text = input('');
  position = input<TooltipPosition>('top');
}
