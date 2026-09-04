import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkingSpace } from './working-space';

describe('WorkingSpace', () => {

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
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('.working-space__menu')).toBeTruthy();
  });
});
