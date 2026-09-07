import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeList } from './tree-list';
import { Data } from '../../data/data.js';

describe('TreeList', () => {
  let component: TreeList<Data>;
  let fixture: ComponentFixture<TreeList<Data>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeList],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
