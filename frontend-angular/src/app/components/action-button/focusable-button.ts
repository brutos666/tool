import { Component } from '@angular/core';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';
import { Focusable } from '../../directives/focusable.js';
import { NodeElement } from '../common/NodeElement.js';
import { ActionButton } from './action-button.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[focusable]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: FocusableButton }],
})
export class FocusableButton extends ActionButton {}
