import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  OnDestroy,
} from '@angular/core';
import { Tooltip } from '../components/tooltip/tooltip.js';
import { TooltipEnable } from '../components/common/TooltipEnable.js';

type Position = 'top' | 'bottom' | 'right' | 'left';

@Directive({
  selector: '[help-tooltip]',
})
export class HelpTooltip implements OnDestroy {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private tooltipProperties = inject(TooltipEnable);

  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private ref: ComponentRef<Tooltip> | null = null;

  private readonly opposite: Record<Position, Position> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

  constructor() {
    effect(() => {
      this.hideTooltip();
      if (this.tooltipProperties.showTooltip() && this.tooltipProperties.tooltip()) {
        this.showTooltip();
      }
    });
  }
  ngOnDestroy(): void {
    this.hideTooltip();
  }

  private showTooltip() {
    this.ref = createComponent(Tooltip, { environmentInjector: this.envInjector });
    this.ref.setInput('text', this.tooltipProperties.tooltip());
    this.ref.setInput('position', this.tooltipProperties.tooltipPosition());

    this.appRef.attachView(this.ref.hostView);
    document.body.appendChild(this.ref.location.nativeElement);
    this.ref.changeDetectorRef.detectChanges();

    this.place();
  }

  private place() {
    const tip = this.ref?.location.nativeElement as HTMLElement;
    const r = this.element.getBoundingClientRect();
    let position = this.tooltipProperties.tooltipPosition();
    // Si la position demandée ne tient pas, on tente l'opposée
    if (!this.fits(position, tip, r) && this.fits(this.opposite[position], tip, r)) {
      position = this.opposite[position];
    }

    const { left, top } = this.coords(position, tip, r);
    tip.classList.remove(`position-${this.tooltipProperties.tooltipPosition()}`);
    tip.classList.add(`position-${position}`);

    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${Math.max(4, top)}px`;
  }

  private hideTooltip() {
    if (!this.ref) return;
    this.appRef.detachView(this.ref.hostView);
    this.ref.destroy();
    this.ref = null;
  }

  private fits(position: Position, tip: HTMLElement, r: DOMRect): boolean {
    const { left, top } = this.coords(position, tip, r);
    return (
      left >= 0 &&
      top >= 0 &&
      left + tip.offsetWidth <= window.innerWidth &&
      top + tip.offsetHeight <= window.innerHeight
    );
  }
  private coords(position: Position, tip: HTMLElement, r: DOMRect) {
    const gap = 8;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;

    switch (position) {
      case 'top':
        return { left: r.left + r.width / 2 - w / 2, top: r.top - h - gap };
      case 'bottom':
        return { left: r.left + r.width / 2 - w / 2, top: r.bottom + gap };
      case 'right':
        return { left: r.right + gap, top: r.top + r.height / 2 - h / 2 };
      case 'left':
        return { left: r.left - w - gap, top: r.top + r.height / 2 - h / 2 };
    }
  }
}
