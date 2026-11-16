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
  selector: 'check-box',
  styleUrl: './check-box.scss',
  templateUrl: './check-box.html',
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: CheckBox }],
})
export class CheckBox extends NodeElement implements AfterViewInit {
  private focusable = inject(Focusable, { self: true });
  private input = viewChild.required<ElementRef>('input');

  id = input.required<string>();
  label = input.required<string>();
  showLabel = input<boolean>(false);

  checked = model<boolean>(false);
  indeterminate = model<boolean>(false);

  ngAfterViewInit(): void {
    this.focusable.setElement(this.input().nativeElement);
  }

  toggle(e: Event) {
    this.checked.update((val) => !val);
    this.indeterminate.set(false);
  }
}
