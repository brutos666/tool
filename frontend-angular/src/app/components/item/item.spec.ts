import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from './item';
import { inputBinding, signal, Signal } from '@angular/core';
import { ItemData } from '../../data/item-data.js';
import { TreeData } from '../../data/tree-data.js';
import { Layout } from '../common/Types.js';

describe('Item', () => {
  let component: Item;
  let fixture: ComponentFixture<Item>;
  let treeSignal: Signal<TreeData<ItemData>>;
  let layoutSignal: Signal<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Item],
    }).compileComponents();

    treeSignal = signal<TreeData<ItemData>>(
      new TreeData(new ItemData('12', 'Test 12', '', '', '', '')),
    );
    layoutSignal = signal<Layout>(Layout.Title);

    fixture = TestBed.createComponent(Item, {
      bindings: [inputBinding('treeData', treeSignal), inputBinding('layoutData', layoutSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
