import { Directive } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { ManualNavigation } from './manual-navigation.js';

@Directive({
  selector: '[workspace-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: RootNavigation }],
})
export class RootNavigation extends ManualNavigation {
  override name = 'RootNavigation';

  protected override accessible: boolean = true;

  override onMouseDown(event: MouseEvent) {
    super.onMouseDown(event);
    this.navigables[this.getFocusIndex()].changeTabAccess(true);
  }

  override changeCurrentIndex(index: number): void {
    this.setCurrentIndex(index);
  }

  override applyTabAccess(): void {
    this.navigables.forEach((navigable) => navigable.changeTabAccess(this.accessible));
  }
}
