import { Component, effect, inject, input, model } from '@angular/core';
import { NodeElement } from '../common/NodeElement.js';
import { FocusableButton } from '../action-button/focusable-button';
import { Button } from '../action-button/button.js';
import { Focusable } from '../../directives/focusable.js';
import { TabNavigation } from '../../directives/tab-navigation';

@Component({
  imports: [FocusableButton, TabNavigation],
  selector: 'confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
  hostDirectives: [Focusable],
  providers: [{ provide: NodeElement, useExisting: ConfirmationDialog }],
})
export class ConfirmationDialog extends NodeElement {
  private navigation = inject(Focusable, { self: true, optional: true });

  question = input<string>('Voulez-vous vraiment faire cette action ?');
  doCallback = input<Function>();
  show = model<boolean>();

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
    this.cancel.bind(this),
  );

  constructor() {
    super();
    effect(() => {
      if (this.show()) {
        this.navigation?.giveFocus();
      }
    });
  }
  cancel() {
    this.show.set(false);
  }

  confirm() {
    this.show.set(false);
    this.doCallback()?.call(this);
  }
}
