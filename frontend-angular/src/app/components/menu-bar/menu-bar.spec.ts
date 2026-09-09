import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuBar } from './menu-bar';
import { inputBinding, signal, Signal } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';

describe('MenuBar', () => {
  let component: MenuBar;
  let fixture: ComponentFixture<MenuBar>;
  let itemsDataSignal: Signal<Array<MenuButton>>;
  let labelSignal: Signal<String>;

  const menuItems: Array<MenuButton> = [];
  menuItems.push(new MenuButton('Action 1'));
  menuItems.push(new MenuButton('Action 2'));
  menuItems.push(new MenuButton('Action 3'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuBar],
    }).compileComponents();

    itemsDataSignal = signal<Array<MenuButton>>(menuItems);
    labelSignal = signal<String>("Menu d'actions");

    fixture = TestBed.createComponent(MenuBar, {
      bindings: [inputBinding('menuItems', itemsDataSignal), inputBinding('label', labelSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu actions', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('.menu__content')).toBeTruthy();
  });

  it('should render menu actions contains actions', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuInnerHtml = expect(hostElement.querySelector('.menu__content')?.innerHTML);
    menuInnerHtml.toContain('Action 1');
    menuInnerHtml.toContain('Action 2');
    menuInnerHtml.toContain('Action 3');
  });

  it('menu should be horizontal when width is big enough', () => {
    const fakeEntry = {
      contentBoxSize: [{ inlineSize: 501, blockSize: 70 } as ResizeObserverSize],
    } as unknown as ResizeObserverEntry;
    component.setMenuWidth(500);
    component.sizeHasChanged([fakeEntry]);
    fixture.detectChanges();

    expect(component.isHorizontal()).toBe(true);
  });
  it('menu should be vertical when width is not big enough', () => {
    const fakeEntry = {
      contentBoxSize: [{ inlineSize: 499, blockSize: 70 } as ResizeObserverSize],
    } as unknown as ResizeObserverEntry;
    component.setMenuWidth(500);
    component.sizeHasChanged([fakeEntry]);
    fixture.detectChanges();

    expect(component.isHorizontal()).toBe(false);
  });
});
