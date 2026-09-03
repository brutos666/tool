import { Component, input } from '@angular/core';
import { Button } from './button';
import { NodeElement } from '../common/NodeElement.js';

@Component({
  imports: [],
  selector: 'app-action-button',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
  standalone: true,
  // TODO : heritage d'un composant classique pour les propriétés disabled, hidden 
  // inputs: ['disabled'] // https://angular.dev/guide/components/inputs
})
export class ActionButton extends NodeElement {

  data = input.required<Button>();

  constructor() {
    super();
  }

  onMouseDown(event: Event) {
    event.preventDefault();
  }


}
