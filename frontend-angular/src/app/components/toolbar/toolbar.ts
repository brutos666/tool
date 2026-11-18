import { Component, input } from '@angular/core';
import { Button } from '../action-button/button.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { FocusableButton } from '../action-button/focusable-button';

@Component({
  imports: [FocusableButton],
  selector: 'toolbar',
  styleUrl: './toolbar.scss',
  templateUrl: './toolbar.html',
  hostDirectives: [ArrowNavigation],
  host: {
    '[aria-label]': 'label()',
    role: 'toolbar',
  },
})
export class Toolbar extends NodeElement {
  buttons = input.required<Array<Button>>();
  toolbarType = input<'menu' | 'icon'>('icon');
  label = input.required<string>();
}
