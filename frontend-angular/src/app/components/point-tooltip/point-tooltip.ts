import { Component, input } from '@angular/core';
import { Halo } from '../halo/halo';

@Component({
  imports: [Halo],
  selector: 'point-tooltip',
  standalone: true,
  styleUrl: './point-tooltip.scss',
  templateUrl: './point-tooltip.html',
  host: {
    role: 'tooltip',
  },
})
export class PointTooltip {
  text = input('');
}
