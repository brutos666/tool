import { Component, input } from '@angular/core';
import { Button } from './button';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';

@Component({
  imports: [Icon],
  selector: 'button[actionButton]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  providers: [{ provide: NodeElement, useExisting: ActionButton }],
  host: {
    class: 'clickable action__button',
    '[class]': 'data().className',
    '[aria-label]': 'data().label',
    '[attr.role]': 'data().role',
    tabindex: '-1',
    '(click)': 'data().onClick()',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class ActionButton extends NodeElement {
  data = input.required<Button>();

  constructor() {
    super();
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
  }
}
