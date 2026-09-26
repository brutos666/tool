import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toolbar } from './toolbar';
import { IconButton } from '../action-button/icon-button.js';
import { Button } from '../action-button/button.js';
import { inputBinding, signal, Signal } from '@angular/core';

describe('Toolbar', () => {
  let component: Toolbar;
  let fixture: ComponentFixture<Toolbar>;
  let buttonsDataSignal: Signal<Array<Button>>;
  const buttons: Array<IconButton> = [];
  buttons.push(new IconButton('id1', 'Action 1', 'plus'));
  buttons.push(new IconButton('id2', 'Action 2', 'plus'));
  buttons.push(new IconButton('id3', 'Action 3', 'plus'));

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
