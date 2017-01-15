/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AppStateService } from './app-state.service';

describe('AppStateService', () => {
	let service: AppStateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AppStateService]
		});
		service = TestBed.get(AppStateService);
	});

	it('remembers an active mail', () => {
		let mail = {};
		service.setActiveMail(mail);
		expect(service.getActiveMail()).toBe(mail);
	});

	it('active mail is undefined until set', () => {
		expect(service.getActiveMail()).toBeUndefined();
	});
});
