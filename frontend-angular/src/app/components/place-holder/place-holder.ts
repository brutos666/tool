import { Component, input } from '@angular/core';
import { PlaceHolderPosition } from '../../services/place-holder-service.js';

@Component({
  selector: 'placeHolder',
  standalone: true,
  styleUrl: './place-holder.scss',
  templateUrl: './place-holder.html',
  host: {
    role: 'separator',
    class: 'drag-over tree__element',
    '[attr.position]': 'position()',
    '[attr.direction]': 'direction()',
    'data-over-id': 'overId()',
  },
})
export class PlaceHolder {
  overId = input<string>('');
  position = input<PlaceHolderPosition>('after');
  direction = input<'column' | 'row'>('column');
}
