import { TestBed, inject } from '@angular/core/testing';

import { MailFactoryService } from './mail-factory.service';

describe('MailFactoryService', () => {
	let service: MailFactoryService;

	beforeEach(() => {
		service = new MailFactoryService();
	});

	it('should create a mail from Writer form', () => {
		expect(service).toBeTruthy();
	});
});
