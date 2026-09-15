import { Component, input } from '@angular/core';
import { Button } from '../action-button/button.js';
import { ActionButton } from '../action-button/action-button.js';
import { Focusable } from '../../directives/focusable.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';

@Component({
  imports: [ActionButton, Focusable, ArrowNavigation],
  selector: 'toolbar',
  styleUrl: './toolbar.scss',
  templateUrl: './toolbar.html',
})
export class Toolbar {
  buttons = input.required<Array<Button>>();
}
