import { AfterViewInit, Directive } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { TabNavigation } from './tab-navigation.js';

@Directive({
  selector: '[workspace-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: RootNavigation }],
})
export class RootNavigation extends TabNavigation implements AfterViewInit {
  override name = 'WorkspaceNavigation';

  ngAfterViewInit(): void {
    this.changeTabAccess(true);
  }

  override onMouseDown(event: MouseEvent) {
    super.onMouseDown(event);
    this.changeTabAccess(true);
    this.giveFocus();
  }

  override interceptKeys(): String[] {
    // Pas de prise en compte de Home et End au niveau de l'interface
    return ['Tab'];
  }
}
