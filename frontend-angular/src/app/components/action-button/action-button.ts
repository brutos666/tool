import { Component, ElementRef, input, viewChild } from '@angular/core';
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
    class: 'clickable',
    '[class]': "buttonType() + '-button' + (data().isVisible() ? '': ' hidden')",
    '[attr.aria-labelledby]': "data().id + '-label'",
    '[aria-label]': 'data().label',
    '[attr.role]': 'role()',
    '(click)': 'onClick($event)',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class ActionButton extends NodeElement {
  data = input.required<Button>();
  buttonType = input.required<'icon' | 'menu' | 'label' | 'primary' | 'item-like'>();
  role = input<'button' | 'menuitem'>('button');

  private inputFile = viewChild<ElementRef>('file');

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
    if (this.buttonType() === 'icon') {
      // Certains boutons ne doivent pas faire perdre le focus courant car ils peuvent agir sur l'élément qui a le focus.
      event.preventDefault();
    }
  }

  onClick(event: MouseEvent) {
    const inputFile = this.inputFile()?.nativeElement;
    if (event.target === inputFile) {
      // Le click du fichier provoque le click du bouton car ce dernier se trouve à l'intérieur du bouton
      return;
    }

    if (this.data().upload) {
      this.inputFile()?.nativeElement.click();
    } else {
      this.data().onClick(event);
    }
  }
}
