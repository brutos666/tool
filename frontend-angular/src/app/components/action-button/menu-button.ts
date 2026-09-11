import { Button } from './button';

export class MenuButton extends Button {
  constructor(id: string, label: string, onClick: Function = () => {}) {
    super(id, label, '', 'menuitem', 'menu', onClick);
  }
}
