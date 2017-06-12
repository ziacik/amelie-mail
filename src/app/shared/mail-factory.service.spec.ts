import { TestBed, inject } from '@angular/core/testing';

import { MailFactoryService } from './mail-factory.service';

describe('MailFactoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MailFactoryService]
    });
  });

  it('should be created', inject([MailFactoryService], (service: MailFactoryService) => {
    expect(service).toBeTruthy();
  }));
});
