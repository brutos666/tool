import { AfterViewInit, Directive, ElementRef, inject, OnDestroy, signal } from '@angular/core';

@Directive({
  selector: '[menu-orientation]',
})
export class MenuOrientation implements AfterViewInit, OnDestroy {
  name = 'MenuOrientation';

  elementRef = inject(ElementRef);
  orientation = signal<'horizontal' | 'vertical'>('horizontal');

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit() {
    const initialWidth = this.elementRef.nativeElement.querySelector('menu').clientWidth;
    this.resizeObserver = new ResizeObserver(this.sizeHasChanged.bind(this, initialWidth));
    this.resizeObserver.observe(this.elementRef.nativeElement, { box: 'content-box' });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  sizeHasChanged(initialWidth: number, entries: Array<ResizeObserverEntry>) {
    for (const entry of entries) {
      if (!entry.contentBoxSize) {
        continue;
      }
      const boxSize = entry.contentBoxSize[0];
      if (boxSize.inlineSize > initialWidth) {
        this.orientation.set('horizontal');
      } else {
        this.orientation.set('vertical');
      }
    }
  }
}
