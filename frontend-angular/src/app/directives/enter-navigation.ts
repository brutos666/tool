import { Directive, model, signal } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { BasicNavigation } from './basic-navigation.js';
import { Navigable } from '../components/common/Navigable.js';
import { KeyboardNavigation } from './keyboard-navigation.js';

@Directive({
  selector: '[enter-directive]',
  providers: [
    { provide: Navigable, useExisting: EnterNavigation },
    { provide: Navigate, useExisting: EnterNavigation },
  ],
  host: {
    '[class]': 'inside() ? "inside" : "outside"',
    '[attr.tabindex]': 'accessible() ? 0 : -1',
  },
})
export class EnterNavigation extends KeyboardNavigation {
  override name = 'EnterNavigation';

  inside = model<boolean>(false);
  accessible = signal<boolean>(false);
  directive!: Navigate;

  override registerChild(navigable: Navigable): void {
    if (!(navigable instanceof BasicNavigation)) {
      return;
    }
    this.directive = navigable;
    super.registerChild(navigable);
  }

  override interceptKeys() {
    return [this.inside() ? 'Escape' : 'Enter'];
  }
  override onKeyDown(event: KeyboardEvent) {
    if (!this.interceptKeys().includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === 'Enter') {
      this.enter();
    } else if (event.key === 'Escape') {
      this.exit();
    }
  }

  enter() {
    this.inside.set(true);
    this.directive.setEnable(true);
    this.accessible.set(false);
    this.navigables[0].giveFocus();
  }

  exit() {
    this.inside.set(false);
    this.accessible.set(true);
    this.directive.setEnable(false);
  }

  override isFocusable(): boolean {
    if (this.inside()) {
      return this.navigables[0].isFocusable();
    }
    const classList = this.elementRef.nativeElement.classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  override giveFocus() {
    if (this.inside()) {
      this.navigables[0].giveFocus();
    } else {
      this.elementRef.nativeElement.focus();
    }
  }
  override isFocused(): boolean {
    if (this.inside()) {
      return this.navigables[0].isFocused();
    }
    return document.activeElement === this.elementRef.nativeElement;
  }

  override changeTabAccess(access: boolean) {
    if (this.inside()) {
      this.navigables[0].changeTabAccess(access);
    } else {
      this.navEnabled.set(access);
      this.accessible.set(access);
    }
  }
}
