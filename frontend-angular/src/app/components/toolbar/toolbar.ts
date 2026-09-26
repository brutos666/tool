import { Component, input, viewChild } from '@angular/core';
import { Button } from '../action-button/button.js';
import { ActionButton } from '../action-button/action-button.js';
import { Focusable } from '../../directives/focusable.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { Composite } from '../common/Composite.js';

@Component({
  imports: [ActionButton, Focusable],
  selector: 'toolbar',
  styleUrl: './toolbar.scss',
  templateUrl: './toolbar.html',
  hostDirectives: [ArrowNavigation],
  providers: [{ provide: NodeElement, useExisting: Toolbar }],
})
export class Toolbar extends Composite {
  buttons = input.required<Array<Button>>();
}
