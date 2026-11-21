import { Component } from '@angular/core';
import { Icon } from '../icon/icon.js';
import { NoFocusable } from '../../directives/no-focusable.js';
import { ActionButton } from './action-button.js';
import { LabelInput } from '../label-input/label-input.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[noFocusable]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  hostDirectives: [NoFocusable],
})
export class NoFocusableButton extends ActionButton {}
