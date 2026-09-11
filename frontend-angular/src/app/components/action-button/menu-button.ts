import { Button } from './button';

export class MenuButton extends Button {
  constructor(label: string, onClick: Function = () => {}) {
    super(label, '', 'menuitem', 'menu', onClick);
  }
}
