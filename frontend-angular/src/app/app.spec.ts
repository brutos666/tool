import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

export class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as any;

let component: App;
let fixture: ComponentFixture<App>;

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render working space', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.working-space')).toBeTruthy();
  });
});
