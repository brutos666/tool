import { Component, signal } from '@angular/core';
import { WorkingSpace } from './components/working-space/working-space.js';

@Component({
  selector: 'app-root',
  imports: [WorkingSpace],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend-angular');


}
