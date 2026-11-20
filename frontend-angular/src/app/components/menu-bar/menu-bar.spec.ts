import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuBar } from './menu-bar';
import { inputBinding, signal, Signal } from '@angular/core';
import { Button } from '../action-button/button.js';

describe('MenuBar', () => {
  let component: MenuBar;
  let fixture: ComponentFixture<MenuBar>;
  let itemsDataSignal: Signal<Array<Button>>;
  let labelSignal: Signal<String>;

  const menuItems: Array<Button> = [];
  menuItems.push(new Button('id1', 'Action 1', 'Description 1', ''));
  menuItems.push(new Button('id2', 'Action 2', 'Description 2', ''));
  menuItems.push(new Button('id3', 'Action 3', 'Description 3', ''));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuBar],
    }).compileComponents();

    itemsDataSignal = signal<Array<Button>>(menuItems);
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
});
