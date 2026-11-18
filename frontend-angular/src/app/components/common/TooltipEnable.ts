import { Signal } from '@angular/core';

export abstract class TooltipEnable {
  abstract tooltip: Signal<string>;
  abstract showTooltip: Signal<boolean>;
  abstract tooltipPosition: Signal<'top' | 'bottom' | 'right' | 'left'>;
}
