import { Component, input } from '@angular/core';
import { LabelInput } from '../label-input/label-input.js';

@Component({
  imports: [LabelInput],
  selector: 'text-input',
  styleUrl: './text-input.scss',
  templateUrl: './text-input.html',
  host: {
    '[id]': 'id()',
    '[aria-label]': 'label()',
    'aria-multiline': 'true',
    contenteditable: 'true',
    property: 'text',
    role: 'textbox',
  },
})
export class TextInput {
  id = input.required<string>();
  label = input.required<string>();
  displayLabel = input<string>('false');

  isDisplayLabel(): boolean {
    return this.displayLabel() === 'true';
  }
}
