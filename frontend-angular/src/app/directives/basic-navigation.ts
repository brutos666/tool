import { Directive, effect, ElementRef, inject, model, OnDestroy, signal } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[basic-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: BasicNavigation },
    { provide: Navigate, useExisting: BasicNavigation },
  ],
  host: {
    '[attr.index-focus]': 'focusIndex()',
  },
})
export class BasicNavigation implements Navigate, Navigable, OnDestroy {
  name = 'BasicNavigation';

  elementRef = inject(ElementRef);

  focusIndex = signal<number>(0);
  navigables: Navigable[] = [];
  navEnabled = model<boolean>(true);

  #selectedIndex = 0;
  // Remonte les parents jusqu'au parent répondant au provider ManualNavigation
  private parentNav = inject(Navigate, { skipSelf: true, optional: true });

  constructor() {
    // S'enregistrer auprès de la navigation parente
    this.parentNav?.registerChild(this);
    effect(() => {
      if (this.navEnabled()) {
        this.elementRef.nativeElement.addEventListener('keydown', this.onKeyDown.bind(this));
      } else {
        this.elementRef.nativeElement.removeEventListener('keydown', this.onKeyDown.bind(this));
      }
    });
  }
  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  setEnable(enable: boolean): void {
    this.navEnabled.set(enable);
    this.changeTabAccess(enable);
    if (enable) {
      this.giveFocus();
    }
  }

  registerChild(navigable: Navigable) {
    this.navigables.push(navigable);
  }

  setFocusIndex(focusIndex: number): void {
    const wasFocused = this.isFocused();
    this.focusComponent(focusIndex);
    if (wasFocused) {
      this.giveFocus();
    }
    this.focusIndex.set(focusIndex);
  }

  focusComponent(index: number) {
    const components = this.navigables;
    if (!(index >= 0 && index < components.length)) {
      return;
    }
    components[this.#selectedIndex].changeTabAccess(false);
    components[index].changeTabAccess(true);
    this.#selectedIndex = index;
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
    event.stopImmediatePropagation();
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

  changeTabAccess(access: boolean) {
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].changeTabAccess(access);
    }
  }

  isFocusable(): boolean {
    const components = this.navigables;
    if (components.length) {
      return components[this.#selectedIndex].isFocusable();
    }
    return false;
  }

  giveFocus() {
    const components = this.navigables;
    components[this.#selectedIndex].giveFocus();
  }

  isFocused(): boolean {
    const components = this.navigables;
    return !!components.find((focusable) => focusable.isFocused());
  }
}
