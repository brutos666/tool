import { Component, computed, inject, input } from '@angular/core';
import SvgUtilities from '../common/SvgUtilities.js';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  imports: [],
  selector: 'icon',
  styleUrl: './icon.scss',
  template: '<span></span>',
  host: {
    '[innerHTML]': 'safeSvg()',
  },
})
export class Icon {
  private sanitizer = inject(DomSanitizer);
  name = input.required<string>();
  safeSvg = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.getSvgIcon(this.name())));

  getSvgIcon(icon: string): string {
    return SvgUtilities.getIcon(icon);
  }
}
