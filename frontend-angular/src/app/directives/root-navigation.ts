import { Directive } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { ManualNavigation } from './manual-navigation.js';
import { Navigable } from '../components/common/Navigable.js';

@Directive({
  selector: '[workspace-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: RootNavigation }],
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

  override onMouseDown(event: MouseEvent) {
    super.onMouseDown(event);
    this.navigables[this.getFocusIndex()].changeTabAccess(true);
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

  override changeCurrentIndex(index: number): void {
    this.setCurrentIndex(index);
  }

  override applyTabAccess(): void {
    this.navigables.forEach((navigable) => navigable.changeTabAccess(this.accessible));
  }
}
