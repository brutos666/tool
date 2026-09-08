import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeList } from './tree-list';
import { Data } from '../../data/data.js';
import { inputBinding, signal, Signal } from '@angular/core';
import { TreeData } from '../../data/tree-data.js';

describe('TreeList', () => {
  let component: TreeList<Data>;
  let fixture: ComponentFixture<TreeList<Data>>;
  let dataListSignal: Signal<Array<TreeData<Data>>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeList],
    }).compileComponents();

    const treeDataList: Array<TreeData<Data>> = [];
    dataListSignal = signal<Array<TreeData<Data>>>(treeDataList);

    fixture = TestBed.createComponent(TreeList, {
      bindings: [inputBinding('dataList', dataListSignal)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
