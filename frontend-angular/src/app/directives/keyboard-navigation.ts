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
    '[attr.index-focus]': 'getFocusIndex()',
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
      this.goFirst();
      return;
    }
    if (event.key === 'End') {
      this.goLast();
      return;
    }
    this.goNext(
      components,
      this.getFocusIndex(),
      event.shiftKey ? `shift+${event.key}` : event.key,
    );
  }

  goNext(components: readonly Navigable[], index: number, key: string) {
    const nextIndex = this.getNextIndex(components, index, key);
    if (nextIndex > -1) {
      this.giveFocusIndex(nextIndex);
    }
  }

  goFirst() {
    // Astuce pour trouver le 1er accessible à partir du début
    const nextIndex = this.getNextIndex(this.navigables, -1, 'Next');
    if (nextIndex > -1) {
      this.giveFocusIndex(nextIndex);
    }
  }
  goLast() {
    const components = this.navigables;
    const nbItems = components.length;
    // Astuce pour trouver le dernier accessible à partir de la fin
    const nextIndex = this.getNextIndex(components, nbItems, 'Previous');
    if (nextIndex > -1) {
      this.giveFocusIndex(nextIndex);
    }
  }

  getNextIndex(components: readonly Navigable[], index: number, key: string): number {
    const nbItems = components.length;
    const selectedIndex = this.giveNext(index, key, nbItems);
    if (selectedIndex === -1 || selectedIndex === nbItems) {
      return -1;
    }
    if (components[selectedIndex].isFocusable()) {
      return selectedIndex;
    }
    return this.getNextIndex(components, selectedIndex, key);
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
