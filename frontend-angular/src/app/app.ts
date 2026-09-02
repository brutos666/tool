import { Component, signal } from '@angular/core';
import { ActionButton } from './components/action-button/action-button.js';

@Component({
  selector: 'app-root',
  imports: [ActionButton],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend-angular');
}
