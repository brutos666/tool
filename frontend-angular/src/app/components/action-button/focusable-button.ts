import { Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon.js';
import { LabelInput } from '../label-input/label-input.js';
import { Focusable } from '../../directives/focusable.js';
import { ActionButton } from './action-button.js';
import { NodeElement } from '../common/NodeElement.js';
import { InfoTooltip } from '../../directives/info-tooltip.js';

@Component({
  imports: [Icon, LabelInput],
  selector: 'button[focusable]',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  providers: [
    { provide: NodeElement, useExisting: FocusableButton },
  ],
  hostDirectives: [Focusable, { directive: InfoTooltip, inputs:['tooltip']}],
})
export class FocusableButton extends ActionButton {
  tooltip = input.required();
}
