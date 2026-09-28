import { Directive, effect, model, OnDestroy } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { BasicNavigation } from './basic-navigation.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[keyboard-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: KeyboardNavigation },
    { provide: Navigate, useExisting: KeyboardNavigation },
  ],
  host: {
    '[attr.index-focus]': 'focusIndex()',
  },
})
export class KeyboardNavigation extends BasicNavigation implements OnDestroy {
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
    this.elementRef.nativeElement.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  override setEnable(enable: boolean): void {
    this.changeTabAccess(enable);
    if (enable) {
      this.giveFocus();
    }
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
    return ['Home', 'End'];
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.navEnabled()) {
      return;
    }
    const components = this.navigables;
    const nbItems = components.length;
    if (nbItems === 0) {
      return;
    }
    if (!this.interceptKeys().includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === 'Home') {
      // Astuce pour trouver le 1er accessible à partir du début
      this.moveToDirection(components, -1, 'Next');
    } else if (event.key === 'End') {
      // Astuce pour trouver le dernier accessible à partir de la fin
      this.moveToDirection(components, nbItems, 'Previous');
    } else {
      this.moveToDirection(
        components,
        this.focusIndex(),
        event.shiftKey ? `shift+${event.key}` : event.key,
      );
    }
  }

  moveToDirection(components: readonly Navigable[], index: number, key: string) {
    const nbItems = components.length;
    const selectedIndex = this.giveNext(index, key, nbItems);
    if (selectedIndex === -1 || selectedIndex === nbItems) {
      return;
    }
    if (components[selectedIndex].isFocusable()) {
      this.setFocusIndex(selectedIndex);
      this.giveFocus();
    } else {
      this.moveToDirection(components, selectedIndex, key);
    }
  }

  giveNext(index: number, key: string, nbItems: number): number {
    let selectedIndex = index;
    switch (key) {
      case 'Next':
        selectedIndex++;
        break;
      case 'Previous':
        selectedIndex--;
        break;
    }
    return selectedIndex;
  }

  override changeTabAccess(access: boolean) {
    this.navEnabled.set(access);
    super.changeTabAccess(access);
  }
}
