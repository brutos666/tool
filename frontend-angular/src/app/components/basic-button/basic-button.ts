import { Component, input } from '@angular/core';
import { Button } from '../action-button/button';
import { NodeElement } from '../common/NodeElement.js';
import { Icon } from '../icon/icon.js';

@Component({
  imports: [Icon],
  selector: 'button[basicButton]',
  styleUrl: './basic-button.scss',
  templateUrl: './basic-button.html',
  standalone: true,
  host: {
    '[id]': 'data().id',
    class: 'clickable',
    '[class]': "data().type + '-button' + (data().isVisible() ? '': ' hidden')",
    '[attr.aria-labelledby]': "data().id + '-label'",
    '[aria-label]': 'data().label',
    '[attr.role]': 'data().role',
    '[attr.tabindex]': '-1',
    '(click)': 'data().onClick($event)',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class BasicButton extends NodeElement {
  data = input.required<Button>();

  constructor() {
    super();
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
  }
}
