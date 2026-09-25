import { Component, input } from '@angular/core';
import { Button } from './button';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';
import { Focusable } from '../../directives/focusable.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[actionButton]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: ActionButton }],
  host: {
    '[id]': 'data().id',
    class: 'clickable action__button',
    '[class]': "data().type + '-button' + (data().isVisible() ? '': ' hidden')",
    '[attr.aria-labelledby]': "data().id + '-label'",
    '[aria-label]': 'data().label',
    '[attr.role]': 'data().role',
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
    // Certains boutons ne doivent pas faire perdre le focus courant car ils peuvent agir sur l'élément qui a le focus. Ce n'est pas le cas du burger menu qui agit sur l'ouverture/fermeture du menu
    if (this.data().type === 'burger') {
      return;
    }
    event.preventDefault();
  }
}
