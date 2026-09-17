import { Component, input, viewChild } from '@angular/core';
import { Button } from '../action-button/button.js';
import { ActionButton } from '../action-button/action-button.js';
import { Focusable } from '../../directives/focusable.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [ActionButton, Focusable, ArrowNavigation],
  selector: 'toolbar',
  styleUrl: './toolbar.scss',
  templateUrl: './toolbar.html',
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: Toolbar }],
})
export class Toolbar extends NodeElement {
  buttons = input.required<Array<Button>>();

  private directive = viewChild.required(ArrowNavigation);

  override getElementToFocus(): HTMLElement {
    return this.directive().getElementToFocus();
  }
}
