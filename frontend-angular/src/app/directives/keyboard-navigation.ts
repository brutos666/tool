import { Directive, effect, model, OnDestroy } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { ManualNavigation } from './manual-navigation.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[keyboard-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: KeyboardNavigation },
    { provide: Navigate, useExisting: KeyboardNavigation },
  ],
  host: {
    '[attr.index-focus]': 'getFocusIndex()',
  },
})
export class KeyboardNavigation extends ManualNavigation implements OnDestroy {
  override name = 'KeyboardNavigation';

  navEnabled = model<boolean>(false);
  #onKeyDownEvent = this.onKeyDown.bind(this);

  constructor() {
    super();
    effect(() => {
      if (this.navEnabled()) {
        this.elementRef.nativeElement.addEventListener('keydown', this.#onKeyDownEvent);
      } else {
        this.elementRef.nativeElement.removeEventListener('keydown', this.#onKeyDownEvent);
      }
    });
  }
  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('keydown', this.#onKeyDownEvent);
  }

  override startNavigation() {
    this.navEnabled.set(true);
    this.getParentNavigation()?.startNavigation();
  }
  override stopNavigation() {
    this.navEnabled.set(false);
    this.getParentNavigation()?.stopNavigation();
  }

  interceptKeys(): String[] {
    return [];
  }

  onKeyDown(event: KeyboardEvent) {
    let modifierKey = event.ctrlKey ? 'Ctrl+' : '';
    if (event.shiftKey) {
      modifierKey += 'Shift+';
    }
    const key = modifierKey + event.key;
    if (!this.navEnabled() || !this.navigables.length || !this.interceptKeys().includes(key)) {
      return;
    }
    event.preventDefault();

    if (this.moveToDirection(key)) {
      event.stopImmediatePropagation();
    }
  }

  moveToDirection(key: string): boolean {
    return true;
  }

  override changeTabAccess(access: boolean) {
    this.navEnabled.set(access);
    super.changeTabAccess(access);
  }
}
