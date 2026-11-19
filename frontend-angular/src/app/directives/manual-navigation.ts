import {
  afterRenderEffect,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  Signal,
  signal,
} from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { Focusable } from './focusable.js';
import { Help } from '../components/common/HelpMessage.js';
import { HelpTooltip } from './help-tooltip.js';
import { TooltipEnable, TooltipPosition } from '../components/common/TooltipEnable.js';
import { TooltipService } from '../services/tooltip-service.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[basic-navigation-directive]',
  hostDirectives: [HelpTooltip],
  providers: [
    { provide: Navigable, useExisting: ManualNavigation },
    { provide: Navigate, useExisting: ManualNavigation },
    { provide: TooltipEnable, useExisting: ManualNavigation },
  ],
  host: {
    '[attr.index-focus]': 'getFocusIndex()',
    '(mousedown)': 'onMouseDown($event)',
  },
})
export class ManualNavigation extends Focusable implements Navigate, TooltipEnable {
  override name = 'ManualNavigation';
  selected = model<boolean>(false);
  selectable = input<boolean>(false);

  protected tooltipService = inject(TooltipService);

  protected helpMessage: Signal<string> = signal<string>('');

  tooltip = signal<string>('');
  showTooltip = signal<boolean>(false);
  tooltipPosition: Signal<TooltipPosition> = signal<TooltipPosition>('right');

  elementRef = inject(ElementRef);

  navigables: Navigable[] = [];
  needSort: boolean = false;
  // Il s'agit juste d'un boolean qui va indiquer que quelque chose a changé
  toggleForReload = signal<boolean>(false);

  #selectedIndex = 0;

  constructor() {
    super();
    effect(() => {
      const show = this.tooltipService.showNavigateHelp();
      if (!this.containFocus) {
        return;
      }
      let message = this.helpMessage();
      if (this.selectable()) {
        message += Help.SELECT_NAVIGATION;
      }
      this.tooltip.set(message);
      this.showTooltip.set(show);
    });
    afterRenderEffect({
      // Déclencher à la mise à jour d'un signal après mise à jour du DOM
      // Comme on veut modifier des attributs html tabindex, on le fait sur la phase write
      write: () => {
        this.toggleForReload();
        if (!this.needSort) {
          return;
        }
        this.sortNavigables(this.navigables);
        this.needSort = false;
        this.applyTabAccess();
        if (this.mustGiveFocus) {
          this.giveFocus();
          this.mustGiveFocus = false;
        }
      },
    });
  }

  startNavigation() {}
  stopNavigation() {}

  override focusChanged(focused: boolean) {
    const wasFocused = this.containFocus;
    super.focusChanged(focused);
    if (wasFocused) {
      this.showTooltip.set(false);
    } else {
      this.showTooltip.set(this.tooltipService.showNavigateHelp());
    }
  }

  getFocusIndex(): number {
    return this.#selectedIndex;
  }

  registerChild(navigable: Navigable) {
    this.mustGiveFocus = this.containFocus;
    this.navigables = this.navigables.concat(navigable);
    this.needSort = true;
    this.forceReload();
  }

  unregisterChild(navigable: Navigable) {
    const indexToRemove = this.navigables.indexOf(navigable);
    if (indexToRemove === -1) {
      return;
    }
    if (this.#selectedIndex === indexToRemove) {
      this.mustGiveFocus = this.containFocus;
    }
    this.#selectedIndex = this.getIndexAfterRemove(indexToRemove);
    this.navigables = this.navigables.filter((component) => component !== navigable);
    this.needSort = true;
    this.forceReload();
  }
  private forceReload() {
    this.toggleForReload.set(!this.toggleForReload());
  }
  private sortNavigables(navigables: Navigable[]) {
    if (navigables.length <= 1) {
      return navigables;
    }
    return navigables.sort((a, b) => {
      const pos = a.getElement().compareDocumentPosition(b.getElement());
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos & Node.DOCUMENT_POSITION_CONTAINS) {
        // Si b suit a alors -1 indique que a est avant b
        return -1;
      }
      return 1;
    });
  }

  onMouseDown(event: MouseEvent) {
    if (!event.target || !(event.target instanceof Element)) {
      return;
    }
    // Exclure les boutons notamment l'ouverture des noeuds
    if (event.defaultPrevented) {
      event.stopPropagation();
      return;
    }
    const index = this.getNavigableIndex(event.target);
    if (index > -1) {
      this.changeCurrentIndex(index);
    } else {
      this.giveFocusIndex(this.getNavigableWithElement(event.target));
      event.preventDefault();
    }
  }
  private getNavigableIndex(element: Element): number {
    return this.navigables.findIndex((navigable) => navigable.getElement().contains(element));
  }
  private getNavigableWithElement(element: Element): number {
    return this.navigables.findIndex((navigable) => element.contains(navigable.getElement()));
  }

  /** Modifie l'élément courant, le rend accessible via la touche Tab et lui donne le focus */
  giveFocusIndex(index: number): void {
    if (!(index >= 0 && index < this.navigables.length)) {
      return;
    }
    this.changeCurrentIndex(index);
    this.navigables[index].changeTabAccess(true);
    this.giveFocus();
  }
  /** Modifie l'élément courant sans perdre le focus */
  setFocusIndex(index: number): void {
    const wasFocused = this.isFocused();
    if (wasFocused) {
      this.giveFocusIndex(index);
    } else {
      this.changeCurrentIndex(index);
    }
  }
  /** Désactive l'élément accessible via la touche Tab et modifie l'élément courant (sans donner le focus) */
  changeCurrentIndex(index: number): void {
    if (this.#selectedIndex !== index) {
      this.navigables[this.#selectedIndex]?.changeTabAccess(false);
      this.setCurrentIndex(index);
    }
  }
  /** Positionne l'élément courant */
  setCurrentIndex(index: number) {
    this.#selectedIndex = index;
  }

  /** Rend l'élément courant accessible via la touche Tab */
  override applyTabAccess() {
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].changeTabAccess(this.accessible);
    }
  }

  override isFocusable(): boolean {
    const components = this.navigables;
    if (components.length) {
      return components[this.#selectedIndex].isFocusable();
    }
    return false;
  }

  /** Donne le focus */
  override giveFocus() {
    this.focusChanged(true);
    const components = this.navigables;
    if (components.length) {
      components[this.#selectedIndex].giveFocus();
    }
  }

  override isFocused(): boolean {
    const components = this.navigables;
    return !!components.find((focusable) => focusable.isFocused());
  }

  private getIndexAfterRemove(indexToRemove: number): number {
    const nbLeft = this.navigables.length - 1;
    if (nbLeft === 0) {
      return 0;
    }
    return this.#selectedIndex > indexToRemove || this.#selectedIndex === nbLeft
      ? this.#selectedIndex - 1
      : this.#selectedIndex;
  }
}
