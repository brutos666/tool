import { Component, inject, model, OnInit } from '@angular/core';
import { Button } from '../action-button/button.js';
import { MenuBar } from '../menu-bar/menu-bar.js';
import { environment } from '../../config/environment.js';
import { ItemService } from '../../services/item-service.js';
import { InfosService } from '../../services/infos-service.js';
import { FILE_SERVICE } from '../../services/file-service.js';
import { ConfirmationDialog } from '../confirm-dialog/confirm-dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeData } from '../../data/tree-data.js';
import { ItemData } from '../../data/item-data.js';
import { Field } from '../field/field';

@Component({
  imports: [MenuBar, ConfirmationDialog, Field],
  selector: 'workspace-menu-bar',
  templateUrl: './workspace-menu-bar.html',
})
export class WorkspaceMenuBar implements OnInit {
  private itemService = inject(ItemService);
  private infosService = inject(InfosService);
  private fileService = inject(FILE_SERVICE);

  rootItem = toSignal(this.itemService.rootItem$, {
    initialValue: new TreeData<ItemData>(ItemService.rootItemData),
  });

  fileName = model<string>('');
  showConfirm = model<boolean>(false);
  showFileName: boolean = false;
  confirmAction: Function = () => {};
  confirmQuestion: string = 'Vous êtes vraiment sûr de vouloir faire ce truc insensé ?';

  label: string = 'Menu des commandes';
  menuItems: Array<Button> = [];
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
          this.askBeforeExport.bind(this),
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
  }

  loadAll() {
    this.itemService.loadItems();
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
    this.itemService.openFile(file).then(() => this.infosService.registerFile(file.name));
  }

  saveAll() {
    const currentFileName = this.infosService.currentFileName();
    if (environment.desktop && currentFileName.length) {
      // Sauvegarde de la base de données, puis sauvegarde dans le dernier fichier ouvert
      this.itemService
        .saveAllItems()
        .then(() => this.itemService.exportItem(this.rootItem(), currentFileName))
        .then((blob) => this.fileService.save(currentFileName, blob));
    } else {
      this.itemService.saveAllItems();
    }
  }

  askBeforeExport() {
    this.proposeFileName();
    this.showFileName = true;
    this.confirmQuestion =
      "Veuillez saisir le nom du fichier à exporter avant de confirmer l'export";
    this.confirmAction = this.exportAll.bind(this);
    this.showConfirm.set(true);
  }
  // Version desktop uniquement
  saveAs() {
    this.proposeFileName();
    this.exportAll();
  }

  async exportAll() {
    const blob = await this.itemService.exportItem(this.rootItem(), this.fileName());
    this.fileService
      .saveAs(this.fileName(), blob)
      .then((fileName) => this.infosService.registerFile(fileName));
  }

  async importAll() {
    const file = await this.fileService.pick('*.txt;*.csv');
    if (!file) return;

    this.itemService.importAllItems(file);
  }

  private proposeFileName() {
    this.fileName.set(
      this.infosService.currentFileName() || this.itemService.proposeFileName(this.rootItem()),
    );
  }
}
