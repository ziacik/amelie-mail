/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MailService } from './mail.service';
import { MailFactoryService } from './mail-factory.service';
import { ContactService } from './contact.service';
import { Mail } from './mail';
import { Contact } from './contact';
import { Recipient } from './recipient';

describe('MailService', () => {
	let service: MailService;
	let mailFactoryService: MailFactoryService;
	let contactService: ContactService;
	let channels: any;
	let mails: Mail[];
	let mailData: any[];
	let contacts: Contact[];

	beforeEach(() => {
		let from = new Contact('from@localhost');
		let contact1 = new Contact('two@localhost');
		let contact2 = new Contact('three@localhost');
		let contact3 = new Contact('four@localhost');
		let recipients1 = [new Recipient(contact1, 'to'), new Recipient(contact2, 'to')];
		let recipients2 = [new Recipient(contact3, 'cc')];
		mailData = [{ one: 'mail'}, { two: 'mail'}];
		let mail1 = new Mail(from, recipients1, {}, {}, { uid: 1 });
		let mail2 = new Mail(from, recipients2, {}, {}, { uid: 2 });
		contacts = [from, contact1, contact2, contact3];
		mails = [mail1, mail2];
		channels = {};
		global['electron'] = {
			ipcRenderer: {
				on: jasmine.createSpy('ipcRenderer.on').and.callFake((channel, callback) => {
					channels[channel] = callback;
				}),
				send: jasmine.createSpy('ipcRenderer.send')
			}
		};
		TestBed.configureTestingModule({
			providers: [MailService, ContactService, MailFactoryService]
		});
		service = TestBed.get(MailService);
		contactService = TestBed.get(ContactService);
		spyOn(contactService, 'register');
		mailFactoryService = TestBed.get(MailFactoryService);
		spyOn(mailFactoryService, 'toServerData').and.returnValue({ converted: 'mail' });
		spyOn(mailFactoryService, 'createFromServerData').and.returnValue(mails);
	});

	it('registers for mail:fetch ipc channel', () => {
		expect(electron.ipcRenderer.on).toHaveBeenCalledWith('mail:fetch', jasmine.any(Function));
	});

	it('sends a mail:listen signal', () => {
		expect(electron.ipcRenderer.send).toHaveBeenCalledWith('mail:listen');
	});

	it('throws when markSeen called without a mail', () => {
		expect(() => service.markSeen(null)).toThrowError(service.errors.mailArgumentMissing || '(error not defined)');
	});

	it('throws when unmarkSeen called without a mail', () => {
		expect(() => service.unmarkSeen(null)).toThrowError(service.errors.mailArgumentMissing || '(error not defined)');
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
		expect(() => service.send(null)).toThrowError(service.errors.mailArgumentMissing || '(error not defined)');
	});

	it('can send a mail:send signal', () => {
		service.send(mails[0]);
		expect(mailFactoryService.toServerData).toHaveBeenCalledWith(mails[0]);
		expect(electron.ipcRenderer.send).toHaveBeenCalledWith('mail:send', { converted: 'mail' });
	});

	describe('when mails are received via mail:fetch channel', () => {
		beforeEach(() => {
			channels['mail:fetch'](null, mailData);
		});

		it('they are converted via factory', () => {
			expect(mailFactoryService.createFromServerData).toHaveBeenCalledWith(mailData);
		});

		it('they are stored in mails property in reverse order', () => {
			let mails = service.getMails();
			expect(!!mails).toBeTruthy();
			expect(mails.length).toEqual(2);
			expect(mails[0].uid).toEqual(2);
			expect(mails[1].uid).toEqual(1);
		});

		it('they are merged with existing mails by adding to the start in reverse order', () => {
			let moreMails = [new Mail(null, [], {}, {}, { uid: 3}), new Mail(null, [], {}, {}, { uid: 4})];
			(mailFactoryService.createFromServerData as jasmine.Spy).and.returnValue(moreMails);
			channels['mail:fetch'](null, mailData);
			let mails = service.getMails();
			expect(!!mails).toBeTruthy();
			expect(mails.map(it => it.uid)).toEqual([4, 3, 2, 1]);
		});

		it('all contacts from them are registered using the contact service', () => {
			expect(contactService.register).toHaveBeenCalledWith(contacts[0]);
			expect(contactService.register).toHaveBeenCalledWith(contacts[1]);
			expect(contactService.register).toHaveBeenCalledWith(contacts[2]);
			expect(contactService.register).toHaveBeenCalledWith(contacts[3]);
		});
	});
});
