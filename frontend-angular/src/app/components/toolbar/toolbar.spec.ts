import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toolbar } from './toolbar';
import { Button } from '../action-button/button.js';
import { inputBinding, signal, Signal } from '@angular/core';

describe('Toolbar', () => {
  let component: Toolbar;
  let fixture: ComponentFixture<Toolbar>;
  let buttonsDataSignal: Signal<Array<Button>>;
  const buttons: Array<Button> = [];
  buttons.push(new Button('id1', 'Action 1', 'Description 1', 'plus'));
  buttons.push(new Button('id2', 'Action 2', 'Description 2', 'plus'));
  buttons.push(new Button('id3', 'Action 3', 'Description 3', 'plus'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toolbar],
    }).compileComponents();

    buttonsDataSignal = signal<Array<Button>>(buttons);

    fixture = TestBed.createComponent(Toolbar, {
      bindings: [inputBinding('buttons', buttonsDataSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
