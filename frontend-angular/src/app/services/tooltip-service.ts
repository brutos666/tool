import { Service, signal } from '@angular/core';
import { TooltipPosition } from '../components/common/WithPositionedTooltip.js';

export type TooltipRef = { parent: HTMLElement; element: HTMLElement; position: TooltipPosition };

@Service()
export class TooltipService {
  private DURATION = 3000; // ms d'affichage pour lire 100 caractères et durée minimale d'affichage
  private MARGIN = 4;

  showNavigateHelp = signal<boolean>(false);

  private readonly opposite: Record<TooltipPosition, TooltipPosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  private readonly otherOrientation: Record<TooltipPosition, TooltipPosition> = {
    top: 'left',
    bottom: 'right',
    left: 'bottom',
    right: 'top',
  };

  private tooltips: TooltipRef[] = [];
  private timer: number | undefined;
  private current: TooltipRef | undefined;

  wrongKeyNavigation() {
    this.showNavigateHelp.set(true);
  }
  correctKeyNavigation() {
    this.showNavigateHelp.set(false);
  }
  mouseNavigation() {
    this.showNavigateHelp.set(false);
  }

  add(tooltip: TooltipRef) {
    this.tooltips.push(tooltip);
    if (this.timer) {
      this.hide(tooltip);
    } else if (this.tooltips.length === 1) {
      this.show(tooltip);
      this.current = undefined;
    } else {
      this.hide(tooltip);
      this.showNext();
    }
  }
  remove(tooltip: TooltipRef) {
    this.tooltips = this.tooltips.filter((e) => e !== tooltip);
    this.hide(tooltip);
    if (this.current === tooltip) {
      this.removeCurrent();
      this.showNext();
    }
  }
  showNext() {
    const next = this.tooltips.shift();
    if (this.current) {
      // Remettre la courante dans la pile
      this.tooltips.push(this.current);
    }
    if (!next) {
      // S'il n'y a pas de suivante, on laisse la courante affichée
      // Il n'y a plus de rotation, donc, plus de courante à remettre dans la pile
      this.removeCurrent();
      return;
    }
    this.hide(this.current);
    this.show(next);
    const textLength = next.element.textContent.length;
    this.timer = setTimeout(
      this.showNext.bind(this),
      Math.max(this.DURATION * (textLength / 100), this.DURATION),
    );
  }
  private hide(tooltip: TooltipRef | undefined) {
    tooltip?.parent.classList.remove('has-tool-tip');
    tooltip?.element.classList.add('hidden');
  }
  private show(tooltip: TooltipRef) {
    tooltip?.parent.classList.add('has-tool-tip');
    tooltip?.element.classList.remove('hidden');
    this.place(tooltip);
    this.current = tooltip;
  }
  private removeCurrent() {
    clearTimeout(this.timer);
    this.current = undefined;
    this.timer = undefined;
  }

  place(tooltip: TooltipRef) {
    const parentRect = tooltip.parent.getBoundingClientRect();
    const tooltipEl = tooltip.element;
    const position = this.giveFitPosition(tooltip.position, tooltipEl, tooltip.parent);
    const { left, top, arrowLeft, arrowTop } = this.coords(position, tooltipEl, parentRect);
    tooltipEl.classList.remove(
      'position-top',
      'position-bottom',
      'position-left',
      'position-right',
    );
    tooltipEl.classList.add(`position-${position}`);

    tooltipEl.style.left = `${Math.max(this.MARGIN, left)}px`;
    tooltipEl.style.top = `${Math.max(this.MARGIN, top)}px`;
    const arrow = tooltipEl.querySelector('.arrow') as HTMLElement;
    if (arrow) {
      arrow.style.left = arrowLeft === 'unset' ? 'unset' : `${arrowLeft}px`;
      arrow.style.top = arrowTop === 'unset' ? 'unset' : `${arrowTop}px`;
    }
  }
  private giveFitPosition(
    tooltipPosition: TooltipPosition,
    tooltipEl: HTMLElement,
    parentEl: HTMLElement,
  ) {
    const parentRect = parentEl.getBoundingClientRect();
    // Si la position demandée ne tient pas, on tente l'opposée
    if (!this.fits(tooltipPosition, tooltipEl, parentRect)) {
      if (this.fits(this.opposite[tooltipPosition], tooltipEl, parentRect)) {
        return this.opposite[tooltipPosition];
      }
      if (this.fits(this.otherOrientation[tooltipPosition], tooltipEl, parentRect)) {
        // Si l'opposée ne tient pas, on tente une disposition contraire (si gauche/droite, on tente au dessus en dessous et inversement)
        return this.otherOrientation[tooltipPosition];
      }
      if (this.fits(this.otherOrientation[this.opposite[tooltipPosition]], tooltipEl, parentRect)) {
        return this.otherOrientation[this.opposite[tooltipPosition]];
      }
    }
    return tooltipPosition;
  }
  private fits(position: TooltipPosition, tooltipEl: HTMLElement, parentRect: DOMRect): boolean {
    const { left, top } = this.coords(position, tooltipEl, parentRect);
    return (
      left >= 0 &&
      top >= 0 &&
      left + tooltipEl.offsetWidth <= window.innerWidth &&
      top + tooltipEl.offsetHeight <= window.innerHeight
    );
  }
  private coords(position: TooltipPosition, tooltipEl: HTMLElement, parentRect: DOMRect) {
    const gap = parseFloat(getComputedStyle(tooltipEl).getPropertyValue('--arrow-size'));
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const w = tooltipRect.width;
    const h = tooltipRect.height;

    const verticalTop = Math.max(
      this.MARGIN,
      Math.min(
        window.innerHeight - tooltipEl.offsetHeight - gap,
        parentRect.top + parentRect.height / 2 - h / 2,
      ),
    );
    const verticalMiddle = parentRect.top + parentRect.height / 2;
    const horizontalLeft = Math.max(
      Math.min(
        window.innerWidth - tooltipEl.offsetWidth - gap,
        parentRect.left + parentRect.width / 2 - w / 2,
      ),
      this.MARGIN,
    );
    const horizontalMiddle = parentRect.left + parentRect.width / 2;

    switch (position) {
      case 'top':
        return {
          left: horizontalLeft,
          top: parentRect.top - h - gap,
          arrowLeft: horizontalMiddle - horizontalLeft,
          arrowTop: '100%',
        };
      case 'bottom':
        return {
          left: horizontalLeft,
          top: parentRect.bottom + gap,
          arrowLeft: horizontalMiddle - horizontalLeft,
          arrowTop: 'unset',
        };
      case 'right':
        return {
          left: parentRect.right + gap,
          top: verticalTop,
          arrowLeft: 'unset',
          arrowTop: verticalMiddle - verticalTop,
        };
      case 'left':
        return {
          left: parentRect.left - w - gap,
          top: verticalTop,
          arrowLeft: '100%',
          arrowTop: verticalMiddle - verticalTop,
        };
    }
  }

  public giveVerticalPosition(tooltipEl: HTMLElement, parentRect: DOMRect) {
    const gap = parseFloat(getComputedStyle(tooltipEl).getPropertyValue('--arrow-size'));
    const tooltipRect = tooltipEl.getBoundingClientRect();
    if (this.isTopOk(tooltipEl, parentRect.bottom + gap)) {
      return 'bottom';
    }
    if (this.isTopOk(tooltipEl, parentRect.top - tooltipRect.height - gap)) {
      return 'top';
    }
    return '';
  }
  public giveHorizontalPosition(tooltipEl: HTMLElement, parentRect: DOMRect) {
    const gap = parseFloat(getComputedStyle(tooltipEl).getPropertyValue('--arrow-size'));
    const tooltipRect = tooltipEl.getBoundingClientRect();
    if (this.isLeftOk(tooltipEl, parentRect.right + gap)) {
      return 'right';
    }
    if (this.isLeftOk(tooltipEl, parentRect.left - tooltipRect.width - gap)) {
      return 'left';
    }
    return '';
  }
  private isTopOk(tooltipEl: HTMLElement, top: number) {
    return top >= 0 && top + tooltipEl.offsetHeight <= window.innerHeight;
  }
  private isLeftOk(tooltipEl: HTMLElement, left: number) {
    return left >= 0 && left + tooltipEl.offsetWidth <= window.innerWidth;
  }
}
