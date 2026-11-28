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

@Component({
  imports: [
    MenuBar,
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

  menuItems: Array<Button> = [];
  mainButtons: Array<Button> = [];
  label: string = 'Menu des commandes';
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
    this.menuItems.push(
      new Button(
        'open',
        'Ouvrir',
        "Charge les tâches à partir d'un fichier",
        'folder',
        this.askBeforeOpen.bind(this),
      ),
    );
    this.menuItems.push(
      new Button(
        'saveAll',
        'Sauvegarder',
        environment.desktop
          ? 'Sauvegarde les tâches'
          : 'Sauvegarde les tâches dans la base de données',
        'save',
        this.saveAll.bind(this),
      ),
    );
    if (environment.desktop) {
      this.menuItems.push(
        new Button(
          'saveAllAs',
          'Enregistrer sous',
          'Sauvegarde les tâches dans un nouveau fichier',
          'saveAs',
          this.saveAs.bind(this),
        ),
      );
    } else {
      this.menuItems.push(
        new Button(
          'exportAll',
          'Télécharger',
          'Télécharge les tâches',
          'upload',
          this.askBeforeExport.bind(this, 'root'),
        ),
      );
    }
    this.menuItems.push(
      new Button(
        'importAll',
        'Importer',
        'Ajoute les tâches depuis dans un fichier',
        'download',
        this.importAll.bind(this),
      ),
    );
    this.menuItems.push(
      new Button(
        'reload',
        'Actualiser',
        'Recharger les tâches',
        'refresh',
        this.loadAll.bind(this),
      ),
    );

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
        this.askBeforeExport.bind(this, 'current'),
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

  loadAll() {
    this.itemService.loadItems();
  }
  loadCurrent() {
    this.itemService.loadCurrentItem();
  }
  async askBeforeOpen() {
    const file = await this.fileService.pick('*.txt;*.csv');
    if (!file) return;

    this.confirmQuestion = `<p>Les tâches ci-dessous seront perdues.</p><p>Êtes-vous sûr de vouloir ouvrir le fichier "${file.name}"?</p>`;
    this.confirmAction = this.open.bind(this, file);
    this.showFileName = false;
    this.showConfirm.set(true);
  }
  open(file: File) {
    this.itemService.openFile(file).then(() => this.infosService.loadInfos());
  }
  saveAll() {
    this.itemService.saveAllItems();
  }
  saveCurrent() {
    this.itemService.saveCurrentItem();
  }
  askBeforeExport(chooseItem: 'root' | 'current') {
    if (chooseItem == 'current' && !this.currentItem()) {
      return;
    }
    this.proposeFileName(chooseItem);
    this.showFileName = true;
    this.confirmQuestion =
      "Veuillez saisir le nom du fichier à exporter avant de confirmer l'export";
    this.confirmAction =
      chooseItem == 'current' ? this.exportCurrent.bind(this) : this.exportAll.bind(this);
    this.showConfirm.set(true);
  }

  // Version desktop uniquement
  saveAs() {
    this.proposeFileName('root');
    this.exportAll();
  }
  async exportAll() {
    const blob = await this.itemService.exportItem(this.rootItem(), this.fileName());
    await this.fileService.save(this.fileName(), blob);
    this.infosService.loadInfos();
  }
  async exportCurrent(item: TreeData<ItemData>) {
    const currentItem = this.currentItem();
    if (!currentItem) {
      return;
    }
    const blob = await this.itemService.exportItem(currentItem, this.fileName());
    return this.fileService.save(this.fileName(), blob);
  }
  async importAll() {
    const file = await this.fileService.pick('*.txt;*.csv');
    if (!file) return;

    this.itemService.importAllItems(file);
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
