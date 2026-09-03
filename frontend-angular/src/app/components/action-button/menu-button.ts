import { Button } from './button';

export class MenuButton extends Button {
  constructor(label: string) {
    super(label, '', 'menuitem', 'menu');
  }
}
