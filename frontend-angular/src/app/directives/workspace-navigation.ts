import { AfterViewInit, Directive } from '@angular/core';
import { Navigate } from '../components/common/Navigate.js';
import { TabNavigation } from './tab-navigation.js';

@Directive({
  selector: '[workspace-navigation-directive]',
  providers: [{ provide: Navigate, useExisting: WorkspaceNavigation }],
})
export class WorkspaceNavigation extends TabNavigation implements AfterViewInit {
  override name = 'WorkspaceNavigation';

  ngAfterViewInit(): void {
    this.changeTabAccess(true);
  }
}
