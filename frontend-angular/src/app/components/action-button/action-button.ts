import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-action-button',
  styleUrl: './action-button.scss',
  templateUrl: './action-button.html',
})
export class ActionButton {
  type = input('menu');
  label = input('Actualiser');
  icon = '';
  role = input('menuitem');
  class = `${this.type}-button`;
  onClick = () => alert('button Clicked');
}
