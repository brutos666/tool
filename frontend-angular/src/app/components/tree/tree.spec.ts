import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tree } from './tree';
import { ItemData } from '../../data/item-data.js';
import { Data } from '../../data/data.js';
import { inputBinding, Signal, signal } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';

describe('Tree', () => {
  let component: Tree<Data>;
  let fixture: ComponentFixture<Tree<Data>>;
  let treeSignal: Signal<TreeData<Data>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tree],
    }).compileComponents();

    const treeData = new TreeData(new Data('12'));
    treeSignal = signal<TreeData<Data>>(treeData);

    fixture = TestBed.createComponent(Tree<Data>, {
      bindings: [inputBinding('treeData', treeSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tree', async () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.querySelector('.tree')).toBeTruthy();
  });
});
