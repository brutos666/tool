import { Component } from '@angular/core';
import { MenuOrientation } from './menu-orientation.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [],
  template: `<nav><menu></menu></nav>`,
  hostDirectives: [MenuOrientation],
})
class TestHostComponent {}

let fixture: ComponentFixture<TestHostComponent>;
let directive: MenuOrientation;

beforeEach(async () => {
  fixture = TestBed.createComponent(TestHostComponent);

  const menuElement = fixture.debugElement.query(By.css('menu')).nativeElement;
  Object.defineProperty(menuElement, 'clientWidth', { configurable: true, value: 500 });
  fixture.detectChanges();

  directive = fixture.debugElement.injector.get(MenuOrientation);
});

it("le menu doit être horizontal si l'espace disponible pour le menu est suffisant", () => {
  const fakeEntry = {
    contentBoxSize: [{ inlineSize: 502, blockSize: 70 } as ResizeObserverSize],
  } as unknown as ResizeObserverEntry;
  directive.sizeHasChanged(500, [fakeEntry]);
  fixture.detectChanges();

  expect(directive.orientation()).toBe('horizontal');
});

it("le menu doit être vertical si l'espace disponible pour le menu n\'est pas suffisant", () => {
  const fakeEntry = {
    contentBoxSize: [{ inlineSize: 499, blockSize: 70 } as ResizeObserverSize],
  } as unknown as ResizeObserverEntry;
  directive.sizeHasChanged(500, [fakeEntry]);
  fixture.detectChanges();

  expect(directive.orientation()).toBe('vertical');
});
