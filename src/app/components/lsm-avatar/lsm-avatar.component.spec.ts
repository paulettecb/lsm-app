import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LsmAvatarComponent } from './lsm-avatar.component';

describe('LsmAvatarComponent', () => {
  let component: LsmAvatarComponent;
  let fixture: ComponentFixture<LsmAvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LsmAvatarComponent]
    });
    fixture = TestBed.createComponent(LsmAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
