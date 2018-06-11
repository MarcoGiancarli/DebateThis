import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebateMenuComponent } from './debate-menu.component';

describe('DebateMenuComponent', () => {
  let component: DebateMenuComponent;
  let fixture: ComponentFixture<DebateMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebateMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebateMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
