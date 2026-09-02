import { Button } from './button.js';

export class MenuButton extends Button {
  constructor(label: string) {
    super(label, '', 'menuitem', 'menu');
  }
}
