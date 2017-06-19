import { Injectable } from '@angular/core';
import { Mail } from './mail';
import { Contact } from './contact';
import { Recipient } from './recipient';

@Injectable()
export class MailFactoryService {
	constructor() {
	}

	public toServerData(mail: Mail): any {
		return {
			to: mail.recipients.filter(r => r.type === 'to').map(r => ({
				address: r.contact.address,
				name: r.contact.name
			})),
			cc: mail.recipients.filter(r => r.type === 'cc').map(r => ({
				address: r.contact.address,
				name: r.contact.name
			})),
			bcc: mail.recipients.filter(r => r.type === 'bcc').map(r => ({
				address: r.contact.address,
				name: r.contact.name
			})),
			subject: mail.subject,
			content: mail.body
		};
	}

	public createFromWriter(mailData: any): Mail {
		let contents = {
			subject: mailData.subject,
			body: mailData.content
		};
		let metaData = {
			bodyType: 'text/html'
		};
		let from: Contact = new Contact('adad');

		return new Mail(from, mailData.recipients, contents, {}, metaData);
	}

	public createFromServerData(mailData: any[]): Mail[] {
		return mailData.map(one => this.createFromServerItem(one));
	}

	private createFromServerItem(mailData: any): Mail {
		let from: Contact = new Contact(mailData.from[0].address, mailData.from[0].name);
		let to: Recipient[] = (mailData.to || []).map(it => new Recipient(new Contact(it.address, it.name), 'to'));
		let cc: Recipient[] = (mailData.cc || []).map(it => new Recipient(new Contact(it.address, it.name), 'cc'));
		let bcc: Recipient[] = (mailData.bcc || []).map(it => new Recipient(new Contact(it.address, it.name), 'bcc'));
		let recipients: Recipient[] = to.concat(cc).concat(bcc);

		let contents = {
			subject: mailData.subject,
			body: mailData.body,
			preview: (mailData.plainBody || '').substr(0, 200),
			attachments: mailData.attachments
		};

		let flags = {
			isSeen: mailData.isSeen
		};

		let metaData = {
			uid: mailData.uid,
			messageId: mailData.messageId,
			date: mailData.date,
			bodyType: mailData.bodyType
		};

		return new Mail(from, recipients, contents, flags, metaData);
	}
}
