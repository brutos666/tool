import { Component, input } from '@angular/core';
import { Button } from './button';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [],
  selector: 'button[actionButton]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  host: {
    'class': "clickable action__button",
    '[class]':"data().className",
    '[aria-label]':"data().label",
    '[attr.role]':"data().role",
    'tabindex':"-1",
    '(click)':"data().onClick()",
    '(mousedown)':"onMouseDown($event)"
  }
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
