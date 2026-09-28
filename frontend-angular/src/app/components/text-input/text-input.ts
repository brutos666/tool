import { Component, computed, ElementRef, inject, input, model, ViewChild } from '@angular/core';
import { NodeElement } from '../common/NodeElement.js';
import { DomSanitizer } from '@angular/platform-browser';
import { Focusable } from '../../directives/focusable';

@Component({
  imports: [],
  selector: 'text-input',
  styleUrl: './text-input.scss',
  templateUrl: './text-input.html',
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: TextInput }],
  host: {
    '(focus)': 'this.input.nativeElement.focus()',
  },
})
export class TextInput extends NodeElement {
  name = 'TextInput';

  private sanitizer = inject(DomSanitizer);

  @ViewChild('input') input!: ElementRef;

  id = input.required<string>();
  label = input.required<string>();
  displayLabel = input<string>('false');
  value = model<string>('');
  safeHtml = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.value()));

  isDisplayLabel(): boolean {
    return this.displayLabel() === 'true';
  }

  enter() {
    this.input.nativeElement.innerText = this.input.nativeElement.innerHTML;
  }
  exit() {
    this.value.set(this.input.nativeElement.innerText);
  }

  override setDisabled() {
    super.setDisabled();
    this.input.nativeElement.contentEditable = 'false';
  }

  override setEnabled() {
    super.setEnabled();
    this.input.nativeElement.contentEditable = 'true';
  }
}
