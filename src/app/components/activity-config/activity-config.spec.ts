import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityConfig } from './activity-config';

describe('ActivityConfig', () => {
  let component: ActivityConfig;
  let fixture: ComponentFixture<ActivityConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
