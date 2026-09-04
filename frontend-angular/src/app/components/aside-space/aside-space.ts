import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'aside[asideSpace]',
  styleUrl: './aside-space.scss',
  templateUrl: './aside-space.html',
})
export class AsideSpace {
  title = input.required<String>();
}
