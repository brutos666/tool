import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { Focusable } from '../../directives/focusable.js';
import { NodeElement } from '../common/NodeElement.js';
import { LabelInput } from '../label-input/label-input.js';

@Component({
  imports: [LabelInput],
  selector: 'field',
  styleUrl: './field.scss',
  templateUrl: './field.html',
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: Field }],
})
export class Field extends NodeElement implements AfterViewInit {
  private focusable = inject(Focusable, { self: true });
  private input = viewChild.required<ElementRef>('input');

  id = input.required<string>();
  label = input.required<string>();
  showLabel = input<boolean>(true);

  value = model<string>('');

  ngAfterViewInit(): void {
    this.focusable.setElement(this.input().nativeElement);
  }
}
