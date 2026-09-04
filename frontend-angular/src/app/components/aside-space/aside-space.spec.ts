import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsideSpace } from './aside-space';
import { inputBinding, Signal, signal } from '@angular/core';

describe('AsideSpace', () => {
  let component: AsideSpace;
  let fixture: ComponentFixture<AsideSpace>;
  let titleSignal: Signal<String>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideSpace],
    }).compileComponents();
    titleSignal = signal<String>('Navigation')

    fixture = TestBed.createComponent(AsideSpace, {
        bindings : [ inputBinding('title', titleSignal) ]
      }
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
    it('should title be "Navigation"', () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const titleElement = hostElement.querySelector('.aside-space__title');
    expect(titleElement?.textContent).toBe("Navigation");
  });
});
