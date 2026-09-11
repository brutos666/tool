import { Component, input } from '@angular/core';
import { ArrowNavigation } from './arrow-navigation';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButton } from '../components/action-button/action-button.js';
import { Button } from '../components/action-button/button.js';
import { Focusable } from './focusable.js';

@Component({
  imports: [ArrowNavigation, ActionButton, Focusable],
  template: `<nav arrow-navigation-directive [orientation]="orientation()" [focusIndex]="index()">
    <header>
      Liste de boutons comme celui ci :
      <button actionButton [data]="btnDataNoFocus">Bouton non focusable</button>
    </header>
    <button actionButton focusable-directive [data]="btnDataFocus1"></button>
    <button actionButton focusable-directive [data]="btnDataFocus2"></button>
    <button actionButton focusable-directive [data]="btnDataFocus3"></button>
  </nav>`,
})
class Test {
  btnDataNoFocus: Button = new Button('id0', 'Pas de focus', '', 'button', 'label');
  btnDataFocus1: Button = new Button('id1', 'Bouton 1', '', 'button', 'label');
  btnDataFocus2: Button = new Button('id2', 'Bouton 2', '', 'button', 'label');
  btnDataFocus3: Button = new Button('id3', 'Bouton 3', '', 'button', 'label');

  orientation = input<'horizontal' | 'vertical'>('horizontal');
  index = input<number>(0);
}

describe('ArrowNavigation', () => {
  let fixture: ComponentFixture<Test>;
  let navElement: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Test);
    await fixture.whenStable();
    navElement = fixture.nativeElement.querySelector('nav');
  });

  it('should navigate to the right when right arrow key is down when menu is horizontal', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 2"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should navigate to the right when right arrow key is down when menu is horizontal', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 2"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should not change focus when right arrow key is down when menu is vertical', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should navigate to the left when left arrow key is down and menu is horizontal and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.componentRef.setInput('index', 2);
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 2"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should not change focus when left arrow key is down and menu is vertical and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('index', 2);
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should navigate to the down when down arrow key is down when menu is vertical', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 2"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));
  });

  it('should not change focus when down arrow key is down and menu is horizontal', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should navigate to up when up arrow key is down and menu is vertical and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('index', 2);
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 2"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 1"]'));
  });

  it('should not change focus when up arrow key is down and menu is horizontal and current focus on last item', async () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.componentRef.setInput('index', 2);
    fixture.detectChanges();

    navElement?.dispatchEvent(event);
    fixture.detectChanges();
    expect(document.activeElement).toBe(navElement?.querySelector('[aria-label="Bouton 3"]'));
  });
});
