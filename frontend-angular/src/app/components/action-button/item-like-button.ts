import { Button } from './button';

export class ItemLikeButton extends Button {
  constructor(id: string, label: string, onClick: Function = () => {}) {
    super(id, label, '', 'button', 'item-like', onClick);
  }
}
