import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'aside-space',
  styleUrl: './aside-space.scss',
  templateUrl: './aside-space.html',
})
export class AsideSpace {
  title = input.required<String>();
}
