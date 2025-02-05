import { TestBed } from '@angular/core/testing';

import { AvatarAnimationsService } from './avatar-animations.service';

describe('AvatarAnimationsService', () => {
  let service: AvatarAnimationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarAnimationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
