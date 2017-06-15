import { Injectable, NgZone } from '@angular/core';
import { ContactService } from './contact.service';
import { MailFactoryService } from './mail-factory.service';
import { Mail } from '../shared/mail';
import { Recipient } from '../shared/recipient';

declare var electron: any;

@Injectable()
export class MailService {
	private mails: Mail[];
	private errors: any;

	constructor(private zone: NgZone, private contactService: ContactService, private mailFactoryService: MailFactoryService) {
		this.mails = [];
		this.errors = {
			mailArgumentMissing: 'Mail argument missing.'
		};

		if (typeof electron !== 'undefined') {
			this.registerFetch();
			this.startListening();
		}
	}

	public getMails(): Mail[] {
		return this.mails;
	}

	public markSeen(mail: Mail) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:mark:seen', mail.uid);
	}

	public unmarkSeen(mail: Mail) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:unmark:seen', mail.uid);
	}

	public send(mail: Mail) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:send', mail);
	}

	private startListening() {
		electron.ipcRenderer.send('mail:listen');
	}

	private registerFetch() {
		electron.ipcRenderer.on('mail:fetch', (event, mailData) => {
			this.zone.run(() => {
				let newMails: Mail[] = this.mailFactoryService.createFromServerData(mailData);
				this.registerContactsFrom(newMails);
				this.mails = newMails.reverse().concat(this.mails);
			});
		});
	}

	private registerContactsFrom(mails: Mail[]) {
		mails.forEach(mail => {
			this.registerContactsFromOne(mail);
		})
	}

	private registerContactsFromOne(mail: Mail) {
		this.contactService.register(mail.from);
		mail.recipients.forEach((recipient: Recipient) => this.contactService.register(recipient.contact));
	}
}
