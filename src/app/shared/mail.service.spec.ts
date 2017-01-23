/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
	let service: MailService;
	let channels: any;

	beforeEach(() => {
		channels = {};
		global.electron = {
			ipcRenderer: {
				on: jasmine.createSpy('ipcRenderer.on').and.callFake((channel, callback) => {
					channels[channel] = callback;
				}),
				send: jasmine.createSpy('ipcRenderer.send')
			}
		};
		TestBed.configureTestingModule({
			providers: [MailService]
		});
		service = TestBed.get(MailService);
	});

	it('registers for mail:fetch ipc channel', () => {
		expect(electron.ipcRenderer.on).toHaveBeenCalledWith('mail:fetch', jasmine.any(Function));
	});

	it('sends a mail:listen signal', () => {
		expect(electron.ipcRenderer.send).toHaveBeenCalledWith('mail:listen');
	});

	describe('when mails are sent via mail:fetch channel', () => {
		let mails: any[];

		beforeEach(() => {
			mails = [
				{
					uid: 1
				}, {
					uid: 2
				}
			];
			channels['mail:fetch'](null, mails);
		});

		it('they are stored in mails property in reverse order', () => {
			let mails = service.getMails();
			expect(!!mails).toBeTruthy();
			expect(mails.length).toEqual(2);
			expect(mails[0].uid).toEqual(2);
			expect(mails[1].uid).toEqual(1);
		});

		it('they are merged with existing mails by adding to the start in reverse order', () => {
			let moreMails = [{ uid: 3 }, { uid: 4 }];
			channels['mail:fetch'](null, moreMails);
			let mails = service.getMails();
			expect(!!mails).toBeTruthy();
			expect(mails.map(it => it.uid)).toEqual([4, 3, 2, 1]);
		});
	});
});
