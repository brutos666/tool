import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { PlaceHolder } from '../components/place-holder/place-holder.js';
import { PlaceHolderPosition, PlaceHolderService } from '../services/place-holder-service.js';

@Directive({
  selector: '[display-place-holder-directive]',
  host: {},
})
/** Cette directive sert à afficher un indicateur de position dans une liste <li>. Elle va être utiliser lors du drag&drop mais aussi lors du survol ou la prise de focus d'un bouton qui va insérer un nouvel élément */
export class DisplayPlaceHolder implements OnDestroy {
  name = 'ListPlaceHolder';
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private placeHolderService = inject(PlaceHolderService);

  // Indique à côté de quel élément doit être placer le placeholder
  overId = input.required<string>();
  position = input.required<PlaceHolderPosition>();

  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private ref: ComponentRef<PlaceHolder> | null = null;
  private overElement!: Element;

  constructor() {
    effect(() => {
      this.hide();
      const overId = this.placeHolderService.overId();
      const targetId = this.placeHolderService.targetId();
      if (overId.length) {
        const containsTarget = this.element.querySelector(`#${targetId}`);
        if (containsTarget) {
          this.show();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private show() {
    const overId = this.overId();
    const position = this.position();
    // Recherche de l'élément associé
    const overElement = this.element.querySelector(`[over-id="${overId}"]`);
    if (!overElement) {
      return;
    }
    this.overElement = overElement;
    const withOrientation = this.overElement.closest('[aria-orientation]');
    const orientation = withOrientation?.getAttribute('aria-orientation') || 'vertical';

    this.ref = createComponent(PlaceHolder, { environmentInjector: this.envInjector });
    this.ref.setInput('overId', overId);
    this.ref.setInput('position', position);
    this.ref.setInput('direction', orientation === 'vertical' ? 'column' : 'row');

    this.appRef.attachView(this.ref.hostView);
    if (position === 'before') {
      this.overElement.insertAdjacentElement('beforebegin', this.ref.location.nativeElement);
    } else {
      this.overElement.insertAdjacentElement('afterend', this.ref.location.nativeElement);
    }
    this.overElement.classList.add('drag-over-parent');
    this.ref.changeDetectorRef.detectChanges();
  }

  private hide() {
    if (!this.ref) return;

    this.overElement.classList.remove('drag-over-parent');
    this.appRef.detachView(this.ref.hostView);
    this.ref.destroy();
    this.ref = null;
  }
}
