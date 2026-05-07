import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Output } from './output';

describe('Output', () => {
  let component: Output;
  let fixture: ComponentFixture<Output>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Output]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Output);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
