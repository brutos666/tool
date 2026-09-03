import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButton } from './action-button';
import { Button } from './button.js';
import { DebugElement, inputBinding, Signal, signal } from '@angular/core';

describe('ActionButton', () => {
  let component: ActionButton;
  let fixture: ComponentFixture<ActionButton>;
  let buttonDataSignal: Signal<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionButton],
    }).compileComponents();

    buttonDataSignal = signal<Button>(new Button('Libellé', '+', 'button', 'label'));
    fixture = TestBed.createComponent(ActionButton, {
      bindings: [
        inputBinding('data', buttonDataSignal)
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
