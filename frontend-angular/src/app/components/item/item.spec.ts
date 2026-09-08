import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from './item';
import { inputBinding, signal, Signal } from '@angular/core';
import { ItemData } from '../../data/item-data.js';

describe('Item', () => {
  let component: Item;
  let fixture: ComponentFixture<Item>;
  let itemSignal: Signal<ItemData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Item],
    }).compileComponents();

    itemSignal = signal<ItemData>(new ItemData('12', 'Test 12', '', '', ''));

    fixture = TestBed.createComponent(Item, {
      bindings: [inputBinding('itemData', itemSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
