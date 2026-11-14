import { Data } from './data.js';
import { ItemForm } from './item-form.js';

export class ItemData extends Data {
  private updates: ItemForm;

  constructor(
    id: string,
    private title: string,
    private text: string,
    private state: string,
    private status: string,
    private CRUDMode: string,
  ) {
    super(id);
    this.updates = new ItemForm({
      id,
      title,
      text,
      done: state === 'DONE',
      indeterminate: false,
      new: CRUDMode === 'CREATE',
      moved: false,
      deleted: false,
    });
  }

  getItemForm() {
    return this.updates;
  }

  getTitle(): string {
    return this.updates.title();
  }
  getText(): string {
    return this.updates.text();
  }
  getState(): string {
    return this.updates.done() ? 'DONE' : 'TODO';
  }
  getStatus(): string {
    return this.status;
  }

  getCRUDMode(): 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' {
    if (this.updates.new()) {
      return 'CREATE';
    }
    if (this.updates.deleted()) {
      return 'DELETE';
    }
    if (this.isModified()) {
      return 'UPDATE';
    }
    return 'READ';
  }

  isNew() {
    return this.updates.new();
  }
  markAsNew() {
    this.updates.new.set(true);
  }
  /**
   * @returns {boolean} - Indique si la tâche a des modifications
   */
  isModified(): boolean {
    return (
      this.title != this.getTitle() ||
      this.text != this.getText() ||
      this.state != this.getState() ||
      this.updates.moved() ||
      this.CRUDMode === 'UPDATE'
    );
  }

  isDeleted() {
    return this.updates.deleted();
  }
  markToDelete() {
    this.updates.deleted.set(true);
  }
  undoToDelete() {
    this.updates.deleted.set(false);
  }
  isToRemove() {
    return this.CRUDMode === 'TO_REMOVE';
  }

  override getData(): Object {
    return {
      id: this.getId(),
      title: this.getTitle(),
      text: this.getText(),
      state: this.getState(),
      status: this.getStatus(),
      CRUDMode: this.getCRUDMode(),
    };
  }

  override clone(): Data {
    const itemData = new ItemData(
      this.getId(),
      this.title,
      this.text,
      this.state,
      this.status,
      this.CRUDMode,
    );
    const newUpdates = itemData.getItemForm();
    newUpdates.text.set(this.updates.text());
    newUpdates.title.set(this.updates.title());
    newUpdates.done.set(this.updates.done());
    newUpdates.new.set(this.updates.new());
    newUpdates.moved.set(this.updates.moved());
    newUpdates.deleted.set(this.updates.deleted());
    return itemData;
  }
}
