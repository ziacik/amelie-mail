import { Injectable } from '@angular/core';
import { Mail } from './mail';
import { Contact } from './contact';
import { Recipient } from './recipient';

@Injectable()
export class MailFactoryService {
	constructor() {
	}

	public createFromWriter(mailData: any): Mail {
		return null;
	}

	public createFromServerData(mailData: any[]): Mail[] {
		return mailData.map(one => this.createFromServerItem(one));
	}

	private createFromServerItem(mailData: any): Mail {
		let from: Contact = new Contact(mailData.from[0].address, mailData.from[0].name);
		let to: Recipient[] = (mailData.to || []).map(it => new Recipient(new Contact(it.address, it.name), 'to'));
		let cc: Recipient[] = (mailData.cc || []).map(it => new Recipient(new Contact(it.address, it.name), 'cc'));
		let bcc: Recipient[] = (mailData.bcc || []).map(it => new Recipient(new Contact(it.address, it.name), 'bcc'));
		return new Mail(from, to.concat(cc).concat(bcc), mailData.subject, mailData.body || '');
	}
}
