import { Component, computed, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';
import { Button } from './button.js';
import { TooltipEnable, TooltipPosition } from '../common/TooltipEnable.js';

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
    '[aria-description]': 'data().description',
    '[attr.role]': 'role()',
    '(click)': 'onClick($event)',
    '(mousedown)': 'onMouseDown($event)',
    '(mouseover)': 'this.showTooltip.set(true)',
    '(mouseleave)': 'this.showTooltip.set(false)',
    '(focus)': 'this.showTooltip.set(true)',
    '(blur)': 'this.showTooltip.set(false)',
  },
})
export class ActionButton extends NodeElement implements TooltipEnable {
  data = input.required<Button>();
  buttonType = input.required<'icon' | 'menu' | 'label' | 'primary' | 'ghost' | 'item-like'>();
  role = input<'button' | 'menuitem'>('button');
  tooltip: string = '';
  showTooltip = signal<boolean>(false);
  tooltipPosition: TooltipPosition = 'top';

  labelButton = computed(
    () =>
      this.role() === 'menuitem' ||
      ['label', 'primary', 'ghost', 'item-like'].includes(this.buttonType()),
  );

  private inputFile = viewChild<ElementRef>('file');

  constructor() {
    super();
    effect(() => (this.tooltip = this.data().description));
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
