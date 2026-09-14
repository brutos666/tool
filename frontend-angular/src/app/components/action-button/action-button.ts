import { Component, input } from '@angular/core';
import { Button } from './button';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[actionButton]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  providers: [{ provide: NodeElement, useExisting: ActionButton }],
  host: {
    '[id]': 'data().id',
    class: 'clickable action__button',
    '[class]': '`${data().type}-button`',
    '[attr.aria-labelledby]': "data().id + '-label'",
    '[aria-label]': 'data().label',
    '[attr.role]': 'data().role',
    tabindex: '-1',
    '(click)': 'data().onClick($event)',
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
