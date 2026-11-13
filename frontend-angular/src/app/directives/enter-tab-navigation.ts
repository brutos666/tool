import { Directive, model } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { Navigable } from '../components/common/Navigable.js';
import { TabNavigation } from './tab-navigation.js';

@Directive({
  selector: '[enter-tab-directive]',
  providers: [
    { provide: Navigable, useExisting: EnterTabNavigation },
    { provide: Navigate, useExisting: EnterTabNavigation },
  ],
  host: {
    '[class]': 'inside() ? "inside" : "outside"',
  },
})
export class EnterTabNavigation extends TabNavigation {
  override name = 'EnterTabNavigation';

  inside = model<boolean>(false);

  override unregisterChild(navigable: Navigable) {
    if (this.inside()) {
      this.inside.set(false);
      this.getParentNavigation()?.startNavigation();
    }
    super.unregisterChild(navigable);
  }

  override onMouseDown(event: MouseEvent) {
    this.containFocus = true;
    this.enter();
  }

  override interceptKeys(): String[] {
    if (this.inside()) {
      return [...super.interceptKeys(), 'Escape'];
    }
    return ['Enter'];
  }

  override moveToDirection(key: string): boolean {
    switch (key) {
      case 'Enter':
        this.enter();
        this.giveFocus();
        return true;
      case 'Escape':
        this.exit();
        this.giveFocus();
        return true;
      default:
        return super.moveToDirection(key);
    }
  }

  enter() {
    // Désactiver l'extérieur
    this.getElement().setAttribute('tabindex', '-1');
    this.getParentNavigation()?.stopNavigation();
    // Activer l'intérieur
    this.inside.set(true);
    this.changeTabAccess(true);
  }

  exit() {
    // Désactiver l'intérieur
    this.changeTabAccess(false);
    this.inside.set(false);
    // Activer l'extérieur
    this.getElement().setAttribute('tabindex', '0');
    this.getParentNavigation()?.startNavigation();
  }

  override isFocusable(): boolean {
    if (this.inside()) {
      return super.isFocusable();
    }
    const classList = this.getElement().classList;
    return !classList.contains('hidden') && !classList.contains('disabled');
  }

  override giveFocus() {
    if (this.inside()) {
      super.giveFocus();
    } else {
      this.getElement().focus();
    }
  }
  override removeFocus(): void {
    this.inside.set(false);
    super.removeFocus();
  }
  override isFocused(): boolean {
    if (this.inside()) {
      return super.isFocused();
    }
    return document.activeElement === this.getElement();
  }
  override applyTabAccess() {
    if (!this.accessible) {
      super.applyTabAccess();
      this.getElement().setAttribute('tabindex', '-1');
      return;
    }
    if (this.inside()) {
      super.applyTabAccess();
    } else {
      this.getElement().setAttribute('tabindex', '0');
    }
  }
}
