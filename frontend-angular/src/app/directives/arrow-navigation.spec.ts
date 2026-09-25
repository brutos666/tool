import { Component, input } from '@angular/core';
import { ArrowNavigation } from './arrow-navigation';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButton } from '../components/action-button/action-button.js';
import { Button } from '../components/action-button/button.js';
import { Composite } from '../components/common/Composite.js';
import { NodeElement } from '../components/common/NodeElement';

@Component({
  imports: [ActionButton, NodeElement],
  hostDirectives: [{ directive: ArrowNavigation, inputs: ['navOrientation:orientation'] }],
  template: `<nav>
    <header>
      <element id="id0" aria-label="Pas de focus">Element non focusable</element>
    </header>
    <button actionButton [data]="btnDataFocus1"></button>
    <button actionButton [data]="btnDataFocus2"></button>
    <button actionButton [data]="btnDataFocus3"></button>
  </nav>`,
})
class Test extends Composite {
  btnDataFocus1: Button = new Button('id1', 'Bouton 1', '', 'button', 'label');
  btnDataFocus2: Button = new Button('id2', 'Bouton 2', '', 'button', 'label');
  btnDataFocus3: Button = new Button('id3', 'Bouton 3', '', 'button', 'label');

  orientation = input<'horizontal' | 'vertical'>('horizontal');
}

describe('ArrowNavigation', () => {
  let fixture: ComponentFixture<Test>;
  let element: HTMLElement;
  let component: Test;
  let directive: ArrowNavigation;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Test);
    component = fixture.componentInstance;
    await fixture.whenStable();
    element = fixture.nativeElement;
    directive = fixture.debugElement.injector.get(ArrowNavigation);
    directive.giveFocus();
  });

  it('should navigate to the right when right arrow key is down when menu is horizontal', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 2"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should navigate to the right when right arrow key is down when menu is horizontal', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 2"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should not change focus when right arrow key is down when menu is vertical', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should navigate to the left when left arrow key is down and menu is horizontal and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    component.setFocusIndex(2);
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 2"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should not change focus when left arrow key is down and menu is vertical and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    fixture.componentRef.setInput('orientation', 'vertical');
    component.setFocusIndex(2);
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should navigate to the down when down arrow key is down when menu is vertical', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 2"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should not change focus when down arrow key is down and menu is horizontal', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should navigate to up when up arrow key is down and menu is vertical and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    fixture.componentRef.setInput('orientation', 'vertical');
    component.setFocusIndex(2);
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 2"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should not change focus when up arrow key is down and menu is horizontal and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    component.setFocusIndex(2);
    fixture.detectChanges();

    element?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(element?.querySelector('[aria-label="Bouton 3"]'));
  });
});
