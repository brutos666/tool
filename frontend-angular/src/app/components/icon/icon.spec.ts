import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { inputBinding, Signal, signal } from '@angular/core';

describe('Icon', () => {
  let component: Icon;
  let fixture: ComponentFixture<Icon>;
  let nameSignal: Signal<String>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icon],
    }).compileComponents();

    nameSignal = signal<String>('plus')

    fixture = TestBed.createComponent(Icon, { bindings: [ inputBinding('name', nameSignal) ] });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
