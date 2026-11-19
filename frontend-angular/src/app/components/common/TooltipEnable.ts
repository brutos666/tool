import { Signal } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'right' | 'left';

export abstract class TooltipEnable {
  abstract tooltip: Signal<string>;
  abstract showTooltip: Signal<boolean>;
  abstract tooltipPosition: Signal<TooltipPosition>;
}
