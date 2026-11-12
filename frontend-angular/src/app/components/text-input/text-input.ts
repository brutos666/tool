import {
  afterRenderEffect,
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  SecurityContext,
  ViewChild,
} from '@angular/core';
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
    '(keydown)': 'onKeyDown($event)',
  },
})
export class TextInput extends NodeElement implements AfterViewInit {
  name = 'TextInput';

  private sanitizer = inject(DomSanitizer);
  private focusable = inject(Focusable, { self: true });

  @ViewChild('input') input!: ElementRef;

  id = input.required<string>();
  label = input.required<string>();
  displayLabel = input<string>('false');
  value = model<string>('');

  safeValue = computed(() => this.sanitizer.sanitize(SecurityContext.HTML, this.value()) || '');

  private inside: boolean = false;

  constructor() {
    super();

    // Astuce pour mettre à jour la valeur au format HTML lorsqu'il y a une actualisation des données
    afterRenderEffect(() => {
      if (this.value() && this.inside) {
        this.input.nativeElement.innerText = this.input.nativeElement.innerHTML;
      }
    });
  }

  ngAfterViewInit(): void {
    this.focusable.setElement(this.input.nativeElement);
  }

  isDisplayLabel(): boolean {
    return this.displayLabel() === 'true';
  }

  enter() {
    this.inside = true;
    this.input.nativeElement.innerText = this.input.nativeElement.innerHTML;
  }
  exit() {
    this.inside = false;
    const safeValue =
      this.sanitizer.sanitize(SecurityContext.HTML, this.input.nativeElement.innerText) || '';
    this.input.nativeElement.innerHTML = safeValue;
    this.value.set(this.input.nativeElement.innerHTML);
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.inside && !['Escape', 'Tab'].includes(event.key)) {
      event.stopPropagation();
    }
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
