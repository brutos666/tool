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
import { TooltipEnable, TooltipPosition } from '../components/common/TooltipEnable.js';

@Directive({
  selector: '[help-tooltip]',
})
export class HelpTooltip implements OnDestroy {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private tooltipProperties = inject(TooltipEnable);

  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private ref: ComponentRef<Tooltip> | null = null;

  private readonly opposite: Record<TooltipPosition, TooltipPosition> = {
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

  private onViewportChange = () => {
    if (!this.ref) return;
    this.place();
  };

  private showTooltip() {
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, true);

    this.ref = createComponent(Tooltip, { environmentInjector: this.envInjector });
    this.ref.setInput('text', this.tooltipProperties.tooltip());
    this.ref.setInput('position', this.tooltipProperties.tooltipPosition());

    this.appRef.attachView(this.ref.hostView);
    document.body.appendChild(this.ref.location.nativeElement);
    this.ref.changeDetectorRef.detectChanges();

    this.element.classList.add('has-tool-tip');
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

    const { left, top, arrowLeft, arrowTop } = this.coords(position, tip, r);
    tip.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
    tip.classList.add(`position-${position}`);

    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${Math.max(4, top)}px`;
    const arrow = tip.querySelector('.arrow') as HTMLElement;
    if (arrow) {
      arrow.style.left = arrowLeft === 'unset' ? 'unset' : `${arrowLeft}px`;
      arrow.style.top = arrowTop === 'unset' ? 'unset' : `${arrowTop}px`;
    }
  }

  private hideTooltip() {
    if (!this.ref) return;

    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);

    this.element.classList.remove('has-tool-tip');
    this.appRef.detachView(this.ref.hostView);
    this.ref.destroy();
    this.ref = null;
  }

  private fits(position: TooltipPosition, tip: HTMLElement, r: DOMRect): boolean {
    const { left, top } = this.coords(position, tip, r);
    return (
      left >= 0 &&
      top >= 0 &&
      left + tip.offsetWidth <= window.innerWidth &&
      top + tip.offsetHeight <= window.innerHeight
    );
  }
  private coords(position: TooltipPosition, tip: HTMLElement, r: DOMRect) {
    const gap = 8;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const verticalTop = Math.max(
      4,
      Math.min(window.innerHeight - tip.offsetHeight - gap, r.top + r.height / 2 - h / 2),
    );
    const verticalMiddle = r.top + r.height / 2;
    const horizontalLeft = Math.max(
      Math.min(window.innerWidth - tip.offsetWidth - gap, r.left + r.width / 2 - w / 2),
      4,
    );
    const horizontalMiddle = r.left + r.width / 2;

    switch (position) {
      case 'top':
        return {
          left: horizontalLeft,
          top: r.top - h - gap,
          arrowLeft: horizontalMiddle - horizontalLeft,
          arrowTop: '100%',
        };
      case 'bottom':
        return {
          left: horizontalLeft,
          top: r.bottom + gap,
          arrowLeft: horizontalMiddle - horizontalLeft,
          arrowTop: 'unset',
        };
      case 'right':
        return {
          left: r.right + gap,
          top: verticalTop,
          arrowLeft: 'unset',
          arrowTop: verticalMiddle - verticalTop,
        };
      case 'left':
        return {
          left: r.left - w - gap,
          top: verticalTop,
          arrowLeft: '100%',
          arrowTop: verticalMiddle - verticalTop,
        };
    }
  }
}
