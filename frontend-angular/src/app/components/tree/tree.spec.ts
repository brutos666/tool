import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tree } from './tree';
import { ItemData } from '../../data/item-data.js';
import { inputBinding, Signal, signal } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';
import { Layout } from '../common/Types.js';

describe('Tree', () => {
  let component: Tree;
  let fixture: ComponentFixture<Tree>;
  let treeSignal: Signal<TreeData<ItemData>>;
  let layoutDataSignal: Signal<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tree],
    }).compileComponents();

    const treeData = new TreeData<ItemData>(
      new ItemData('12', 'Truc', 'Y a ce truc à faire', 'TODO', '', ''),
    );
    treeSignal = signal<TreeData<ItemData>>(treeData);
    layoutDataSignal = signal<Layout>(Layout.Todo);

    fixture = TestBed.createComponent(Tree, {
      bindings: [
        inputBinding('treeData', treeSignal),
        inputBinding('layoutData', layoutDataSignal),
      ],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tree', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('.tree__content')).toBeTruthy();
  });
});
