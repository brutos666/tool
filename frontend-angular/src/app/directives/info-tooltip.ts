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
import { TooltipService } from '../services/tooltip-service.js';
import { PointTooltip } from '../components/point-tooltip/point-tooltip.js';
import { TooltipEnable } from '../components/common/TooltipEnable.js';

@Directive({
  selector: '[info-tooltip]',
})
export class InfoTooltip implements OnDestroy {
  static SHOW_TIP_DELAY = 1000;
  static HIDE_TIP_DELAY = 2000;
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private tooltipProperties = inject(TooltipEnable);
  private tooltipService = inject(TooltipService);

  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private ref: ComponentRef<PointTooltip> | null = null;
  private tooltipEl: HTMLElement | undefined;

  private onViewportChange = () => {
    if (this.tooltipEl) {
      this.place();
    }
  };

  private timerId!: number;
  private timerHideId!: number;

  constructor() {
    effect(() => {
      const show = this.tooltipProperties.showTooltip();
      if (show) {
        this.showAfterDelay();
      } else {
        clearTimeout(this.timerId);
        clearTimeout(this.timerHideId);
        this.hideProgressively();
      }
    });
  }
  ngOnDestroy(): void {
    this.hideTooltip();
  }

  private showAfterDelay() {
    this.timerId = setTimeout(() => {
      this.hideTooltip();
      this.showTooltip();
      this.timerHideId = setTimeout(() => {
        this.hideProgressively();
      }, InfoTooltip.HIDE_TIP_DELAY);
    }, InfoTooltip.SHOW_TIP_DELAY);
  }
  private hideProgressively() {
    this.tooltipEl?.classList.remove('tooltip--show');
    setTimeout(() => {
      this.hideTooltip();
    }, 600);
  }

  private showTooltip() {
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, true);

    this.ref = createComponent(PointTooltip, { environmentInjector: this.envInjector });
    this.ref.setInput('text', this.tooltipProperties.tooltip);
    this.tooltipEl = this.ref.location.nativeElement;

    this.appRef.attachView(this.ref.hostView);
    this.element.classList.add('relative-position');
    this.element.appendChild(this.ref.location.nativeElement);
    this.ref.changeDetectorRef.detectChanges();

    this.place();
  }

  private hideTooltip() {
    if (!this.ref) return;
    this.element.classList.remove('relative-position');

    if (this.tooltipEl) {
      this.tooltipEl = undefined;
    }

    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);

    this.appRef.detachView(this.ref.hostView);
    this.ref.destroy();
    this.ref = null;
  }

  private place() {
    if (!this.tooltipEl) {
      return;
    }
    const parentRect = this.element.getBoundingClientRect();
    this.tooltipEl.style.width = `${parentRect.width}px`;
    this.tooltipEl.style.height = `${parentRect.height}px`;

    const tip = this.tooltipEl.querySelector('.tip') as HTMLElement;
    this.tooltipEl.classList.remove(
      'position-top',
      'position-bottom',
      'position-left',
      'position-right',
    );
    const positionV = this.tooltipService.giveVerticalPosition(tip, parentRect);
    if (positionV) {
      this.tooltipEl.classList.add(`position-${positionV}`);
    }
    const positionH = this.tooltipService.giveHorizontalPosition(tip, parentRect);
    if (positionH) {
      this.tooltipEl.classList.add(`position-${positionH}`);
    }
    this.tooltipEl.classList.add('tooltip--show');
  }
}
