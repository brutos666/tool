export abstract class Navigable {
  abstract giveFocus(): void;
  abstract isFocused(): boolean;
  abstract isFocusable(): boolean;
  abstract changeTabAccess(access: boolean): void;
}
