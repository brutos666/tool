import { Button } from './button';

export class IconButton extends Button {
  constructor(id: string, label: string, icon: string, onClick: Function = () => {}) {
    super(id, label, icon, 'button', 'icon', onClick);
  }
}
