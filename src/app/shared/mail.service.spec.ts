/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MailService } from './mail.service';

fdescribe('MailService', () => {
	let service: MailService;
	let channels: any;
	let mails: any[];

	beforeEach(() => {
		mails = [
			{
				uid: 1
			}, {
				uid: 2
			}
		];
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

	it('throws when markSeen called without a mail', () => {
		expect(() => service.markSeen()).toThrowError(service.errors.mailArgumentMissing || '(error not defined)');
	});

	it('throws when unmarkSeen called without a mail', () => {
		expect(() => service.unmarkSeen()).toThrowError(service.errors.mailArgumentMissing || '(error not defined)');
	});

	it('can send a mail:mark:seen signal', () => {
		service.markSeen(mails[1]);
		expect(electron.ipcRenderer.send).toHaveBeenCalledWith('mail:mark:seen', 2);
	});

	it('can send a mail:unmark:seen signal', () => {
		service.unmarkSeen(mails[0]);
		expect(electron.ipcRenderer.send).toHaveBeenCalledWith('mail:unmark:seen', 1);
	});

	it('throws when send called without a mail', () => {
		expect(() => service.send()).toThrowError(service.errors.mailArgumentMissing || '(error not defined)');
	});

	it('can send a mail:send signal', () => {
		service.send(mails[0]);
		expect(electron.ipcRenderer.send).toHaveBeenCalledWith('mail:send', mails[0]);
	});

	describe('when mails are received via mail:fetch channel', () => {
		beforeEach(() => {
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
