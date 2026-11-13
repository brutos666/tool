export abstract class Navigable {
  abstract getElement(): HTMLElement;
  abstract giveFocus(): void;
  abstract removeFocus(): void;
  abstract isFocused(): boolean;
  abstract isFocusable(): boolean;
  abstract changeTabAccess(access: boolean): void;
}
