import { Component, input, output } from '@angular/core';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';
import { Button } from './button.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[actionButton]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  host: {
    '[id]': 'data().id',
    type: 'action-button',
    class: 'clickable',
    '[class]': "data().type + '-button' + (data().isVisible() ? '': ' hidden')",
    '[attr.aria-labelledby]': "data().id + '-label'",
    '[aria-label]': 'data().label',
    '[attr.role]': 'data().role',
    '(click)': 'onClick($event)',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class ActionButton extends NodeElement {
  data = input.required<Button>();

  constructor() {
    super();
  }

  rotate90(rotate: boolean) {
    if (rotate) {
      this.getElement().classList.add('rotate90');
    } else {
      this.getElement().classList.remove('rotate90');
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.data().type === 'icon') {
      // Certains boutons ne doivent pas faire perdre le focus courant car ils peuvent agir sur l'élément qui a le focus.
      event.preventDefault();
    }
  }

  onClick(event: MouseEvent) {
    this.data().onClick(event);
  }
}
