import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgApexchartsComponent } from './ng-apexcharts.component';

describe('NgApexchartsComponent', () => {
  let component: NgApexchartsComponent;
  let fixture: ComponentFixture<NgApexchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgApexchartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgApexchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
