import { Component, input } from '@angular/core';
import { FocusableButton } from '../action-button/focusable-button';
import { Button } from '../action-button/button.js';
import { Popup } from '../common/Popup.js';
import { ShowButton } from '../../directives/show-button';
import { InfoTooltip } from '../../directives/info-tooltip';

@Component({
  imports: [FocusableButton, ShowButton, InfoTooltip],
  selector: 'confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmationDialog extends Popup {
  question = input<string>('Voulez-vous vraiment faire cette action ?');
  doCallback = input<Function>();
  override focusIndex = 2;

  confirmButton: Button = new Button(
    'dialogConfirmButton',
    'Confirmer',
    "Confirmer l'action en cours",
    '',
    this.confirm.bind(this),
  );

  cancelButton: Button = new Button(
    'dialogCancelButton',
    'Annuler',
    "Annuler l'action en cours",
    '',
  );

  confirm() {
    this.doCallback()?.call(this);
  }
}
