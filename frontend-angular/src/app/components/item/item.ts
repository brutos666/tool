import {
  AfterContentInit,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TextInput } from '../text-input/text-input';
import { ItemService } from '../../services/item-service.js';
import { Toolbar } from '../toolbar/toolbar.js';
import { Button } from '../action-button/button.js';
import { TreeData } from '../../data/tree-data.js';
import { Layout, Right } from '../common/Types.js';
import { NodeElement } from '../common/NodeElement.js';
import { CheckBox } from '../check-box/check-box.js';
import { FocusableButton } from '../action-button/focusable-button';
import { PlaceHolderService } from '../../services/place-holder-service.js';

@Component({
  imports: [TextInput, Toolbar, CheckBox, FocusableButton],
  selector: 'item',
  styleUrl: './item.scss',
  templateUrl: './item.html',
})
export class Item extends NodeElement implements AfterContentInit {
  name = 'Item';

  private itemService = inject(ItemService);
  private placeHolderService = inject(PlaceHolderService);

  layoutData = input.required<Layout>();
  treeData = input.required<TreeData<ItemData>>();
  title = input<boolean>(false);

  showAddInto = signal<boolean>(false);
  showAddUnder = signal<boolean>(false);
  showDelete = signal<boolean>(false);
  showUndoDelete = signal<boolean>(false);

  // Crée un signal computed pour extraire la propriété
  itemData = computed(() => this.treeData().getContent());
  itemForm = computed(() => this.itemData().getItemForm());
  itemId = this.itemService.giveUniqueId();
  deleted = computed(() => this.itemForm().deleted());
  leaf = computed(() => this.treeData().getChildren().length === 0);
  indeterminateState = false;

  crudModeData = computed(() => this.itemData().getCRUDMode());

  @ViewChild('done') doneComponent!: TextInput;
  @ViewChild('title') titleComponent!: TextInput;
  @ViewChild('text') textComponent!: TextInput;

  addIntoAction = new Button(
    `addInto${this.itemId}`,
    'Ajouter',
    "Ajout d'une sous-tâche à la tâche courante",
    'plus',
    this.doAddInto.bind(this, 'Nouvel item'),
  );
  addUnderAction = new Button(
    `addAfter${this.itemId}`,
    'Ajouter en dessous',
    "Ajout d'une tâche en dessous de la tâche courante",
    'arrowDownPlus',
    this.doAddUnder.bind(this, 'Nouvel item'),
  );
  deleteAction = new Button(
    `delete${this.itemId}`,
    'Marquer à supprimer',
    'Marque la tâche comme supprimée. La suppression définitive est effectuée lors de la sauvegarde',
    'cross',
    this.markToDelete.bind(this),
  );
  undoToDeleteAction = new Button(
    `undoDelete${this.itemId}`,
    'Annuler la suppression',
    'Annule le marquage comme supprimée',
    'undo',
    this.undoToDelete.bind(this),
  );

  constructor() {
    super();
    effect(() => {
      const deleted = this.deleted();
      const leaf = this.leaf();
      const rights = this.getRights(this.layoutData());
      if (rights.includes(Right.create)) {
        this.showAddInto.set(!deleted && leaf);
        this.showAddUnder.set(true);
      }
      if (rights.includes(Right.delete)) {
        this.showDelete.set(!deleted);
        this.showUndoDelete.set(deleted);
      }
    });
  }

  ngAfterContentInit(): void {
    const itemId = this.itemId;
  }

  doAddInto(title: string) {
    const treeData = this.treeData();
    this.itemService.addChildItem(treeData, title);
  }
  doAddUnder(title: string) {
    const treeData = this.treeData();
    this.itemService.addAfterItem(treeData, title);
  }
  markToDelete() {
    const treeData = this.treeData();
    this.itemService.markToDelete(treeData);
  }
  undoToDelete() {
    const treeData = this.treeData();
    this.itemService.undoToDelete(treeData);
  }

  isPostIt(layout: Layout) {
    return [Layout.Story, Layout.Rules, Layout.Sample, Layout.Question].includes(layout);
  }
  hasDone(layout: Layout) {
    return this.isPostIt(layout) || [Layout.Todo].includes(layout);
  }
  hasText(layout: Layout) {
    return this.isPostIt(layout);
  }
  hasFooterToolbar(layout: Layout) {
    return layout === Layout.Title || layout === Layout.Todo;
  }
  getRights(layout: Layout): Right[] {
    if (this.title()) {
      return [Right.update];
    }
    if (this.isPostIt(layout)) {
      if (layout === Layout.Story) {
        return [Right.update];
      }
      return [Right.update, Right.delete];
    }
    return [Right.create, Right.update, Right.delete];
  }

  /**
   * Retourne la classe CSS correspondant au statut
   * @param {'CREATE'|'UPDATE'|'DELETE'|'READ'} mode - Mode CRUD de l'item
   * @returns {string} - classe CSS à appliquer
   */
  getClassForCRUDMode(mode: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ'): string {
    switch (mode) {
      case 'CREATE':
        return 'item--crud-created';
      case 'UPDATE':
        return 'item--crud-updated';
      case 'DELETE':
        return 'item--crud-deleted';
      case 'READ':
        return 'item--crud-read';
      default:
        return '';
    }
  }
  getClassForLayout(layout: Layout) {
    if (this.isPostIt(layout)) {
      return 'item--post-it';
    }
    switch (layout) {
      case Layout.Todo:
        return 'item--todo';
      case Layout.Title:
        return 'item--title';
      default:
        return 'item--block';
    }
  }
}
