import { Component, input, model } from '@angular/core';
import { Focusable } from '../../directives/focusable.js';
import { NodeElement } from '../common/NodeElement.js';
import { LabelInput } from '../label-input/label-input.js';

@Component({
  imports: [LabelInput],
  selector: 'check-box',
  styleUrl: './check-box.scss',
  templateUrl: './check-box.html',
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: CheckBox }],
})
export class CheckBox extends NodeElement {
  id = input.required<string>();
  label = input.required<string>();
  showLabel = input<boolean>(false);

  checked = model<boolean>(false);
  indeterminate = model<boolean>(false);

  toggle(e: Event) {
    this.checked.update((val) => !val);
    this.indeterminate.set(false);
  }
}
