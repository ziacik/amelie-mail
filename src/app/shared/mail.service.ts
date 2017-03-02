import { Injectable, NgZone } from '@angular/core';
import { ContactService } from './contact.service';

declare var electron: any;

@Injectable()
export class MailService {
	private mails: any[];
	private errors: any;

	constructor(private zone: NgZone, private contactService: ContactService) {
		this.mails = [];
		this.errors = {
			mailArgumentMissing: 'Mail argument missing.'
		};

		if (typeof electron !== 'undefined') {
			this.registerFetch();
			this.startListening();
		}
	}

	public getMails(): any[] {
		return this.mails;
	}

	public markSeen(mail: any) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:mark:seen', mail.uid);
	}

	public unmarkSeen(mail: any) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:unmark:seen', mail.uid);
	}

	public send(mail: any) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:send', mail);
	}

	private startListening() {
		electron.ipcRenderer.send('mail:listen');
	}

	private registerFetch() {
		electron.ipcRenderer.on('mail:fetch', (event, mails) => {
			this.zone.run(() => {
				this.registerContactsFrom(mails);
				this.mails = mails.slice().reverse().concat(this.mails);
			});
		});
	}

	private registerContactsFrom(mails: any[]) {
		mails.forEach(mail => {
			this.registerContactsFromOne(mail);
		})
	}

	private registerContactsFromOne(mail: any) {
		if (mail.from) {
			this.registerContacts(mail.from);
		}
		if (mail.to) {
			this.registerContacts(mail.to);
		}
		if (mail.cc) {
			this.registerContacts(mail.cc);
		}
	}

	private registerContacts(contacts: any[]) {
		contacts.forEach(contact => {
			this.contactService.register(contact);
		});
	}
}
