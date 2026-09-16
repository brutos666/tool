import { Data } from './data.js';

export class ItemData extends Data {
  private new: boolean = false;
  private moved: boolean = false;
  private deleted: boolean = false;
  private newTitle!: string | null;
  private newText!: string | null;
  private newState!: string | null;

  constructor(
    id: string,
    private title: string,
    private text: string,
    private state: string,
    private status: string,
    private CRUDMode: string,
  ) {
    super(id);
  }

  setValueProperty(property: string, value: string) {
    switch (property) {
      case 'title':
        this.newTitle = this.title === value ? null : value;
        break;
      case 'text':
        this.newText = this.text === value ? null : value;
        break;
      case 'state':
        this.newState = this.state === value ? null : value;
        break;
      default:
        break;
    }
  }
  getTitle(): string {
    return this.newTitle || this.title;
  }
  getText(): string {
    return this.newText || this.text;
  }
  getState(): string {
    return this.newState || this.state;
  }

  getCRUDMode(): 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' {
    if (this.isNew()) {
      return 'CREATE';
    }
    if (this.isDeleted()) {
      return 'DELETE';
    }
    if (this.isModified()) {
      return 'UPDATE';
    }
    return 'READ';
  }

  isNew() {
    return this.new;
  }
  markAsNew() {
    this.new = true;
  }
  /**
   * @returns {boolean} - Indique si la tâche a des modifications
   */
  isModified(): boolean {
    return !!(this.newTitle || this.newText || this.newState || this.moved);
  }

  isDeleted() {
    return this.deleted;
  }
  markToDelete() {
    this.deleted = true;
  }
  undoToDelete() {
    this.deleted = false;
  }

  override getData(): Object {
    return {
      id: this.getId(),
      title: this.getTitle(),
      text: this.getText(),
      state: this.getState(),
      status: this.status,
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
    itemData.newTitle = this.newTitle;
    itemData.newText = this.newText;
    itemData.newState = this.newState;
    itemData.new = this.new;
    itemData.moved = this.moved;
    itemData.deleted = this.deleted;
    return itemData;
  }
}
