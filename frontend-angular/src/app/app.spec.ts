import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterTestingHarness } from '@angular/router/testing';
import { WorkingSpace } from './components/working-space/working-space.js';
import { provideRouter } from '@angular/router';

let component: App;
let fixture: ComponentFixture<App>;

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, WorkingSpace],
      providers: [provideRouter([{ path: 'test', component: WorkingSpace }])],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render working space', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/test', WorkingSpace);

    expect(harness.routeNativeElement?.classList.contains('working-space')).toBeTruthy();
  });
});
