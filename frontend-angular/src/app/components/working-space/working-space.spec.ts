import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkingSpace } from './working-space';
import { ResizeObserverMock } from '../../app.spec.js';

describe('WorkingSpace', () => {

  globalThis.ResizeObserver = ResizeObserverMock as any;
  
  let component: WorkingSpace;
  let fixture: ComponentFixture<WorkingSpace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingSpace],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkingSpace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu bar', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.menu')).toBeTruthy();
  });
});
