import { signal } from '@angular/core';

interface ItemFormData {
  id: string;
  title: string;
  text: string;
  done: boolean;
  indeterminate: boolean;
  new: boolean;
  moved: boolean;
  deleted: boolean;
}

export class ItemForm {
  id: string = '';
  title = signal<string>('');
  text = signal<string>('');
  done = signal<boolean>(false);
  indeterminate = signal<boolean>(false);
  new = signal<boolean>(false);
  moved = signal<boolean>(false);
  deleted = signal<boolean>(false);

  constructor(itemFormData: ItemFormData) {
    this.id = itemFormData.id;
    this.title.set(itemFormData.title);
    this.text.set(itemFormData.text);
    this.done.set(itemFormData.done);
    this.indeterminate.set(itemFormData.indeterminate);
    this.new.set(itemFormData.new);
    this.moved.set(itemFormData.moved);
    this.deleted.set(itemFormData.deleted);
  }
}
