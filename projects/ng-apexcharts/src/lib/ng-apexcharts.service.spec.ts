import { TestBed } from '@angular/core/testing';

import { NgApexchartsService } from './ng-apexcharts.service';

describe('NgApexchartsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgApexchartsService = TestBed.get(NgApexchartsService);
    expect(service).toBeTruthy();
  });
});
