import { Component, inject, model, OnInit } from '@angular/core';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../action-button/button.js';
import { ItemService } from '../../services/item-service.js';
import { FILE_SERVICE } from '../../services/file-service.js';
import { ConfirmationDialog } from '../confirm-dialog/confirm-dialog';
import { Field } from '../field/field';
import { TreeData } from '../../data/tree-data.js';

@Component({
  imports: [Toolbar, ConfirmationDialog, Field],
  selector: 'workspace-main-toolbar',
  templateUrl: './workspace-main-toolbar.html',
})
export class WorkspaceMainToolbar implements OnInit {
  private itemService = inject(ItemService);
  private fileService = inject(FILE_SERVICE);

  currentItem = this.itemService.currentItemSignal;

  mainButtons: Array<Button> = [];
  mainLabel: string = 'Menu des commandes de la vue';

  fileName = model<string>('');
  showConfirm = model<boolean>(false);
  showFileName: boolean = false;
  confirmAction: Function = () => {};
  confirmQuestion: string = 'Vous êtes vraiment sûr de vouloir faire ce truc insensé ?';

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
  loadCurrent() {
    this.itemService.loadCurrentItem();
  }
  saveCurrent() {
    this.itemService.saveCurrentItem();
  }
  askBeforeExport() {
    const currentItem = this.currentItem();
    if (!currentItem) {
      return;
    }
    this.fileName.set(this.itemService.proposeFileName(currentItem));

    this.showFileName = true;
    this.confirmQuestion =
      "Veuillez saisir le nom du fichier à exporter avant de confirmer l'export";
    this.confirmAction = this.exportCurrent.bind(this);
    this.showConfirm.set(true);
  }
  async exportCurrent() {
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
}
