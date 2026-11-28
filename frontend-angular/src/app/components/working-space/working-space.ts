import {
  Component,
  effect,
  ElementRef,
  inject,
  model,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MenuBar } from '../menu-bar/menu-bar.js';
import { TreeList } from '../tree-list/tree-list';
import { ItemService } from '../../services/item-service.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeData } from '../../data/tree-data.js';
import { ItemData } from '../../data/item-data.js';
import { Layout } from '../common/Types.js';
import { RootNavigation } from '../../directives/root-navigation.js';
import { NodeElement } from '../common/NodeElement.js';
import { SpaceBody } from '../space/space-body';
import { SpaceHeader } from '../space/space-header';
import { Space } from '../space/space.js';
import { SpaceFooter } from '../space/space-footer';
import { NotificationCenter } from '../notification-center/notification-center';
import { FocusableButton } from '../action-button/focusable-button';
import { Item } from '../item/item';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../action-button/button.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation';
import { ArrowNavigation } from '../../directives/arrow-navigation';
import { Help } from '../common/HelpMessage.js';
import { ConfirmationDialog } from '../confirm-dialog/confirm-dialog';
import { Field } from '../field/field';
import { DisplayPlaceHolder } from '../../directives/display-place-holder';
import { PlaceHolderService } from '../../services/place-holder-service.js';
import { FILE_SERVICE } from '../../services/file-service.js';
import { environment } from '../../config/environment.js';
import { InfosService } from '../../services/infos-service.js';
import { WorkspaceMenuBar } from '../workspace-menu-bar/workspace-menu-bar';

@Component({
  imports: [
    TreeList,
    Space,
    SpaceBody,
    SpaceHeader,
    SpaceFooter,
    FocusableButton,
    NotificationCenter,
    FocusableButton,
    Item,
    Toolbar,
    EnterTabNavigation,
    ArrowNavigation,
    ConfirmationDialog,
    Field,
    DisplayPlaceHolder,
    WorkspaceMenuBar,
  ],
  standalone: true,
  selector: 'working-space',
  styleUrl: './working-space.scss',
  templateUrl: './working-space.html',
  hostDirectives: [RootNavigation],
  host: {
    class: 'working-space',
    'aria-label': 'Espace de travail',
  },
})
export class WorkingSpace extends NodeElement implements OnInit, OnDestroy {
  name = 'WorkingSpace';

  private itemService = inject(ItemService);
  private infosService = inject(InfosService);
  private placeHolderService = inject(PlaceHolderService);
  private fileService = inject(FILE_SERVICE);

  static NEW_SPACE_LABEL = 'Saisir un espace';
  static NEW_ITEM_LABEL = 'Saisir un pense-bête';

  fileName = model<string>('');
  showConfirm = model<boolean>(false);
  showFileName: boolean = false;
  confirmAction: Function = () => {};
  confirmQuestion: string = 'Vous êtes vraiment sûr de vouloir faire ce truc insensé ?';

  emptyStateNav = Help.NO_TREE;
  emptyStateMain = Help.NO_TREE_SELECTED;

  rootItem = toSignal(this.itemService.rootItem$, {
    initialValue: new TreeData<ItemData>(ItemService.rootItemData),
  });
  currentItem = this.itemService.currentItemSignal;

  mainButtons: Array<Button> = [];
  navLayout: Layout = Layout.Title;
  mainLayout: Layout = Layout.Todo;
  navAddButton: Button = new Button(
    'addNewSpace',
    'Ajouter un élément',
    'Ajoute un espace',
    '',
    this.doAddSpace.bind(this),
  );
  mainLabel: string = 'Menu des commandes de la vue';
  mainAddButton: Button = new Button(
    'addNewItem',
    'Ajouter un élément',
    'Ajoute une tâche à la vue courante',
    '',
    this.doAddItem.bind(this),
  );

  @ViewChild('splitter') splitterRef!: ElementRef;
  @ViewChild('navSpace', { read: ElementRef }) navSpaceRef!: ElementRef;

  private onPointerMoveEvent: Function = this.onPointerMove.bind(this);
  private onPointerUpEvent: Function = this.onPointerUp.bind(this);

  constructor() {
    super();
  }

  ngOnInit(): void {
    // NOTE : je ne sais pas encore quel terme utilisé pour définir les tâches qui s'affichent à droite
    const vue = 'la vue courante';

    this.mainButtons.push(
      new Button(
        'saveCurrent',
        `Sauvegarder ${vue}`,
        `Sauvegarde ${vue}`,
        'save',
        this.saveCurrent.bind(this),
      ),
    );
    this.mainButtons.push(
      new Button(
        'uploadCurrent',
        `Exporter ${vue}`,
        'Sauvegarde la tâche dans un fichier',
        'upload',
        this.askBeforeExport.bind(this),
      ),
    );
    this.mainButtons.push(
      new Button(
        'importCurrent',
        `Importer dans ${vue}`,
        `Charge ${vue} à partir d'un fichier`,
        'download',
        this.importCurrent.bind(this),
      ),
    );
    this.mainButtons.push(
      new Button(
        'reloadCurrent',
        `Actualiser ${vue}`,
        `Recharge ${vue}`,
        'refresh',
        this.loadCurrent.bind(this),
      ),
    );
  }

  ngOnDestroy() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
    splitter.removeEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  loadCurrent() {
    this.itemService.loadCurrentItem();
  }
  saveCurrent() {
    this.itemService.saveCurrentItem();
  }
  askBeforeExport() {
    if (!this.currentItem()) {
      return;
    }
    this.proposeFileName('current');
    this.showFileName = true;
    this.confirmQuestion =
      "Veuillez saisir le nom du fichier à exporter avant de confirmer l'export";
    this.confirmAction = this.exportCurrent.bind(this);
    this.showConfirm.set(true);
  }
  async exportCurrent(item: TreeData<ItemData>) {
    const currentItem = this.currentItem();
    if (!currentItem) {
      return;
    }
    const blob = await this.itemService.exportItem(currentItem, this.fileName());
    return this.fileService.saveAs(this.fileName(), blob);
  }
  async importCurrent() {
    const file = await this.fileService.pick('*.txt;*.csv');
    if (!file) return;

    this.itemService.importCurrentItem(file);
  }

  doAddSpace() {
    this.itemService.addRootItem(WorkingSpace.NEW_SPACE_LABEL);
  }
  doAddItem() {
    const currentItem = this.currentItem();
    if (currentItem) {
      this.itemService.addChildItem(currentItem, WorkingSpace.NEW_ITEM_LABEL);
    }
  }

  private proposeFileName(chooseItem: 'root' | 'current') {
    if (chooseItem == 'root') {
      this.fileName.set(
        this.infosService.currentFileName() || this.itemService.proposeFileName(this.rootItem()),
      );
      return;
    }
    const currentItem = this.currentItem();
    if (currentItem) {
      this.fileName.set(this.itemService.proposeFileName(currentItem));
    }
  }

  onPointerDown(event: PointerEvent) {
    event.preventDefault();
    const splitter = this.splitterRef.nativeElement;
    splitter.setPointerCapture(event.pointerId);
    splitter.addEventListener('pointermove', this.onPointerMoveEvent);
    splitter.addEventListener('pointerup', this.onPointerUpEvent, { once: true });
  }

  onPointerMove(event: PointerEvent) {
    const workingSpace = this.getElement();
    const navSpace = this.navSpaceRef.nativeElement;
    const offset = workingSpace.getBoundingClientRect().left;
    navSpace.style.width = `${event.clientX - offset}px`;
  }
  onPointerUp() {
    const splitter = this.splitterRef.nativeElement;
    splitter.removeEventListener('pointermove', this.onPointerMoveEvent);
  }
}
