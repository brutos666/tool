import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'label[labelInput]',
  styleUrl: './label-input.scss',
  templateUrl: './label-input.html',
  host: {
    '[for]': 'for()',
  },
})
export class LabelInput {
  text = input.required<string>();
  for = input.required<string>();
}
