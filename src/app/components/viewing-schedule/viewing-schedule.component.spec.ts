import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewingScheduleComponent } from './viewing-schedule.component';

describe('ViewingScheduleComponent', () => {
  let component: ViewingScheduleComponent;
  let fixture: ComponentFixture<ViewingScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewingScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
