import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelInput } from './label-input';
import { inputBinding, signal, Signal } from '@angular/core';

describe('LabelInput', () => {
  let component: LabelInput;
  let fixture: ComponentFixture<LabelInput>;
  let textSignal: Signal<String>;
  let forSignal: Signal<String>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelInput],
    }).compileComponents();

    textSignal = signal<String>('Libellé');
    forSignal = signal<String>('inputId');

    fixture = TestBed.createComponent(LabelInput, {
      bindings: [inputBinding('text', textSignal), inputBinding('for', forSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
