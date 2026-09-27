import { Directive } from '@angular/core';
import { Navigable } from '../components/common/Navigable.js';
import { Navigate } from '../components/common/Navigate.js';
import { BasicNavigation } from './basic-navigation.js';

/** Cette classe gère la navigation manuelle d'un composant focusable à un autre */
@Directive({
  selector: '[manual-navigation-directive]',
  providers: [
    { provide: Navigable, useExisting: ManualNavigation },
    { provide: Navigate, useExisting: ManualNavigation },
  ],
})
export class ManualNavigation extends BasicNavigation {
  override name = 'ManuelNavigation';
}
