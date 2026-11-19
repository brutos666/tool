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
import { TooltipRef, TooltipService } from '../services/tooltip-service.js';

@Directive({
  selector: '[help-tooltip]',
})
export class HelpTooltip implements OnDestroy {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private tooltipProperties = inject(TooltipEnable);
  private tooltipService = inject(TooltipService);

  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private ref: ComponentRef<Tooltip> | null = null;
  private tooltipRef: TooltipRef | undefined;

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
    if (this.tooltipRef) {
      this.tooltipService.place(this.tooltipRef);
    }
  };

  private showTooltip() {
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, true);

    this.ref = createComponent(Tooltip, { environmentInjector: this.envInjector });
    this.ref.setInput('text', this.tooltipProperties.tooltip());
    this.ref.setInput('position', this.tooltipProperties.tooltipPosition());
    this.tooltipRef = {
      parent: this.element,
      element: this.ref.location.nativeElement,
      position: this.tooltipProperties.tooltipPosition(),
    };

    this.appRef.attachView(this.ref.hostView);
    document.body.appendChild(this.ref.location.nativeElement);
    this.ref.changeDetectorRef.detectChanges();

    this.tooltipService.add(this.tooltipRef);
  }

  private hideTooltip() {
    if (!this.ref) return;

    if (this.tooltipRef) {
      this.tooltipService.remove(this.tooltipRef);
      this.tooltipRef = undefined;
    }

    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);

    this.appRef.detachView(this.ref.hostView);
    this.ref.destroy();
    this.ref = null;
  }
}
