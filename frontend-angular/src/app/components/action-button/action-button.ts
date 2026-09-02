import { Component, ElementRef, input, ViewChild } from '@angular/core';
import { Button } from './button.js';

@Component({
  imports: [],
  selector: 'app-action-button',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
})
export class ActionButton {
  @ViewChild('buttonId') buttonElement!: ElementRef<HTMLButtonElement>;

  button = input.required<Button>();

  onMouseDown(event: Event) {
    event.preventDefault();
  }

  giveFocus() {
    this.changeTabAccess(true);
    this.buttonElement.nativeElement.focus();
  }
  isFocused() {
    return document.activeElement === this.buttonElement.nativeElement;
  }
  changeTabAccess(access: Boolean) {
    this.buttonElement.nativeElement.setAttribute('tabindex', access ? '0' : '-1');
  }
  changeVisibility(visible: Boolean) {
    if (visible) {
      this.buttonElement.nativeElement.classList.remove('hidden');
    } else {
      this.buttonElement.nativeElement.classList.add('hidden');
    }
  }
  isVisible() {
    return !this.buttonElement.nativeElement.classList.contains('hidden');
  }
}
