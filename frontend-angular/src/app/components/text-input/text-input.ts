import { Component, computed, ElementRef, inject, input, model, ViewChild } from '@angular/core';
import { LabelInput } from '../label-input/label-input.js';
import { NodeElement } from '../common/NodeElement.js';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  imports: [LabelInput],
  selector: 'text-input',
  styleUrl: './text-input.scss',
  templateUrl: './text-input.html',
})
export class TextInput extends NodeElement {
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
