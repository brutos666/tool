import { Signal } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'right' | 'left';

export abstract class TooltipEnable {
  abstract showTooltip: Signal<boolean>;
  abstract tooltip: string;
  abstract tooltipPosition: TooltipPosition;
}
