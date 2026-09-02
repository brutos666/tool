import { Component, signal } from '@angular/core';
import { MenuButton } from './components/action-button/menu-button.js';
import { Menu } from './components/menu/menu.js';

@Component({
  selector: 'app-root',
  imports: [Menu],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend-angular');

  menuItems: Array<MenuButton> = [];

  constructor() {
    this.menuItems.push(new MenuButton('Actualiser'));
    this.menuItems.push(new MenuButton('Sauvegarder tout'));
    this.menuItems.push(new MenuButton('Sauvegarder la vue courante'));
    this.menuItems.push(new MenuButton('Exporter tout'));
    this.menuItems.push(new MenuButton('Importer'));
  }
}
