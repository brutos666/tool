import { Directive } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { ManualNavigation } from './manual-navigation.js';
import { Navigable } from '../components/common/Navigable.js';
import { TooltipEnable } from '../components/common/TooltipEnable.js';

@Directive({
  selector: '[workspace-navigation-directive]',
  providers: [
    { provide: Navigate, useExisting: RootNavigation },
    { provide: TooltipEnable, useExisting: RootNavigation },
  ],
  host: {
    'aria-label': 'Outils de saisie des tâches',
    '(keydown)': 'onKeyDown($event)',
    '(click)': 'this.tooltipService.mouseNavigation()',
  },
})
export class RootNavigation extends ManualNavigation {
  override name = 'RootNavigation';

  protected override accessible: boolean = true;
  private onFocusEvent = this.onFocus.bind(this);

  override registerChild(navigable: Navigable): void {
    super.registerChild(navigable);
    navigable.getElement().addEventListener('focus', this.onFocusEvent, true);
  }
  override unregisterChild(navigable: Navigable) {
    super.unregisterChild(navigable);
    navigable.getElement().removeEventListener('focus', this.onFocusEvent, true);
  }

  onFocus(event: FocusEvent) {
    if (!event.currentTarget || !(event.currentTarget instanceof Element)) {
      return;
    }
    const index = this.navigables.findIndex((nav) => nav.getElement() === event.currentTarget);
    if (index > -1) {
      this.changeCurrentIndex(index);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (['Tab', 'Shift'].includes(event.key)) {
      return;
    }
    if (event.key === 'Escape' && this.tooltipService.showNavigateHelp()) {
      this.tooltipService.correctKeyNavigation();
    } else {
      this.tooltipService.wrongKeyNavigation();
    }
  }

  override changeCurrentIndex(index: number): void {
    const selectedIndex = this.getFocusIndex();
    if (selectedIndex === index) {
      return;
    }
    // Chaque espace doit pouvoir être accédé par la touche Tab => on ne fera jamais changeTabAccess(false)
    this.setCurrentIndex(index);
  }

  override applyTabAccess(): void {
    this.navigables.forEach((navigable) => navigable.changeTabAccess(true));
  }
}
