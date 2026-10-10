import { Component } from '@angular/core';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';
import { Focusable } from '../../directives/focusable.js';
import { BasicButton } from '../basic-button/basic-button.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[actionButton]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: ActionButton }],
  host: {
    class: 'action__button',
  },
})
export class ActionButton extends BasicButton {
  constructor() {
    super();
  }

  override onMouseDown(event: MouseEvent) {
    // Certains boutons ne doivent pas faire perdre le focus courant car ils peuvent agir sur l'élément qui a le focus. Ce n'est pas le cas du burger menu qui agit sur l'ouverture/fermeture du menu
    if (this.data().type === 'burger') {
      return;
    }
    super.onMouseDown(event);
  }
}
