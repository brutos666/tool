import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInput } from './text-input';
import { inputBinding, signal, Signal } from '@angular/core';

describe('TextInput', () => {
  let component: TextInput;
  let fixture: ComponentFixture<TextInput>;
  let idSignal: Signal<String>;
  let labelSignal: Signal<String>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInput],
    }).compileComponents();

    idSignal = signal<String>('id1');
    labelSignal = signal<String>('Nom');

    fixture = TestBed.createComponent(TextInput, {
      bindings: [inputBinding('id', idSignal), inputBinding('label', labelSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
