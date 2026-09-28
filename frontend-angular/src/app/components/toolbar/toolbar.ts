import { Component, inject, input, viewChild } from '@angular/core';
import { Button } from '../action-button/button.js';
import { ActionButton } from '../action-button/action-button.js';
import { Focusable } from '../../directives/focusable.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [ActionButton, Focusable],
  selector: 'toolbar',
  styleUrl: './toolbar.scss',
  templateUrl: './toolbar.html',
  hostDirectives: [ArrowNavigation],
})
export class Toolbar extends NodeElement {
  buttons = input.required<Array<Button>>();
}
