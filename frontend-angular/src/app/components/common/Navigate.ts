import { Navigable } from './Navigable.js';

export abstract class Navigate {
  abstract registerChild(navigable: Navigable): void;
  abstract unregisterChild(navigable: Navigable): void;
  /** Modifie l'élément courant sans perdre le focus */
  abstract setFocusIndex(focusIndex: number): void;
  abstract startNavigation(): void;
  abstract stopNavigation(): void;
}
