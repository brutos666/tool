import { Navigable } from './Navigable.js';

export abstract class Navigate {
  abstract setFocusableList(focusableList: readonly Navigable[]): void;
  abstract setFocusIndex(focusIndex: number): void;
}
