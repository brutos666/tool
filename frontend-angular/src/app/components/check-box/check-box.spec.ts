import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckBox } from './check-box';
import { inputBinding, signal, Signal } from '@angular/core';

describe('CheckBox', () => {
  let component: CheckBox;
  let fixture: ComponentFixture<CheckBox>;
  let idSignal: Signal<String>;
  let labelSignal: Signal<String>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckBox],
    }).compileComponents();

    idSignal = signal<String>('maCheckBox');
    labelSignal = signal<String>('Sélectionner le truc');

    fixture = TestBed.createComponent(CheckBox, {
      bindings: [inputBinding('id', idSignal), inputBinding('label', labelSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
