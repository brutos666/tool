import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { inputBinding, signal, Signal } from '@angular/core';
import { MenuButton } from '../action-button/menu-button.js';


describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let itemsDataSignal: Signal<Array<MenuButton>>;
  let labelSignal: Signal<String>;

  const menuItems:Array<MenuButton> = [];
    menuItems.push(new MenuButton('Action 1'));
    menuItems.push(new MenuButton('Action 2'));
    menuItems.push(new MenuButton('Action 3'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
    }).compileComponents();

    itemsDataSignal = signal<Array<MenuButton>>(menuItems);
    labelSignal = signal<String>('Menu d\'actions')

    fixture = TestBed.createComponent(Menu, {
      bindings: [
        inputBinding('menuItems', itemsDataSignal),
        inputBinding('label', labelSignal)
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu actions', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('.menu__actions')).toBeTruthy();
  });

  it('should render menu actions contains actions', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuInnerHtml = expect(hostElement.querySelector('.menu__actions')?.innerHTML)
    menuInnerHtml.toContain('Action 1');
    menuInnerHtml.toContain('Action 2');
    menuInnerHtml.toContain('Action 3');
  });

  it('menu should be horizontal when width is big enough', () => {
    const fakeEntry = {
      contentBoxSize: [
        { inlineSize: 501, blockSize: 70 } as ResizeObserverSize,
      ],
    } as unknown as ResizeObserverEntry;
    component.setMenuWidth(500);
    component.sizeHasChanged([fakeEntry]);
    fixture.detectChanges();

    expect(component.isHorizontal()).toBe(true);
  });
  it('menu should be vertical when width is not big enough', () => {
    const fakeEntry = {
      contentBoxSize: [
        { inlineSize: 499, blockSize: 70 } as ResizeObserverSize,
      ],
    } as unknown as ResizeObserverEntry;
    component.setMenuWidth(500);
    component.sizeHasChanged([fakeEntry]);
    fixture.detectChanges();

    expect(component.isHorizontal()).toBe(false);
  });

  it('should navigate to the right when right arrow key is down when menu is horizontal', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.setHorizontal(true);
    component.focusItem(0);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 2"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 3"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 3"]')).toBe(document.activeElement);
  });
  it('should not change focus when right arrow key is down when menu is vertical', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.setHorizontal(false);
    component.focusItem(0);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 1"]')).toBe(document.activeElement);
  });

  it('should navigate to the left when left arrow key is down and menu is horizontal and current focus on last item', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    component.setHorizontal(true);
    component.focusItem(2);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 2"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 1"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 1"]')).toBe(document.activeElement);
  });

  it('should not change focus when left arrow key is down and menu is vertical and current focus on last item', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    component.setHorizontal(false);
    component.focusItem(2);
    menuActions?.dispatchEvent(event);
    fixture.detectChanges();
    expect(menuActions?.querySelector('[aria-label="Action 3"]')).toBe(document.activeElement);
  });

  it('should navigate to the down when down arrow key is down when menu is vertical', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.setHorizontal(false);
    component.focusItem(0);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 2"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 3"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 3"]')).toBe(document.activeElement);
  });

  it('should not change focus when down arrow key is down and menu is horizontal', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.setHorizontal(true);
    component.focusItem(0);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 1"]')).toBe(document.activeElement);
  });

  it('should navigate to up when up arrow key is down and menu is vertical and current focus on last item', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.setHorizontal(false);
    component.focusItem(2);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 2"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 1"]')).toBe(document.activeElement);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();

    expect(menuActions?.querySelector('[aria-label="Action 1"]')).toBe(document.activeElement);
  });

  it('should not change focus when up arrow key is down and menu is horizontal and current focus on last item', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    const menuActions = hostElement.querySelector('.menu__actions');
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.setHorizontal(true);
    component.focusItem(2);

    menuActions?.dispatchEvent(event);
    fixture.detectChanges();
    
    expect(menuActions?.querySelector('[aria-label="Action 3"]')).toBe(document.activeElement);
  });

});
