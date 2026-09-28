import { Navigable } from './Navigable.js';

export abstract class Navigate {
  abstract registerChild(navigable: Navigable): void;
  abstract setFocusIndex(focusIndex: number): void;
  abstract setEnable(enable: boolean): void;
  abstract startNavigation(): void;
  abstract stopNavigation(): void;
}
