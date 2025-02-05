import { TestBed } from '@angular/core/testing';

import { HandGesturesService } from './hand-gestures.service';

describe('HandGesturesService', () => {
  let service: HandGesturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandGesturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
