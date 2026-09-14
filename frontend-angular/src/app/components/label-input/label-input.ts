import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'label[labelInput]',
  styleUrl: './label-input.scss',
  templateUrl: './label-input.html',
  host: {
    '[id]': 'id()',
  },
})
export class LabelInput {
  text = input.required<string>();
  id = input.required<string>();
}
