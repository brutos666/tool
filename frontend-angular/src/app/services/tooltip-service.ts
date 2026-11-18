import { Service, signal } from '@angular/core';

@Service()
export class TooltipService {
  showNavigateHelp = signal<boolean>(false);

  wrongKeyNavigation() {
    this.showNavigateHelp.set(true);
  }
  correctKeyNavigation() {
    this.showNavigateHelp.set(false);
  }
  mouseNavigation() {
    this.showNavigateHelp.set(false);
  }
}
