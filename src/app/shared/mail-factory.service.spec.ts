import { TestBed, inject } from '@angular/core/testing';

import { MailFactoryService } from './mail-factory.service';
import { Mail } from './mail';
import { Recipient } from './recipient';
import { Contact } from './contact';

describe('MailFactoryService', () => {
	let service: MailFactoryService;

	beforeEach(() => {
		service = new MailFactoryService();
	});

	function testServerData(): any {
		return {
			uid: 123,
			messageId: 'message-id',
			date: new Date(2017, 2, 2, 2, 2, 2),
			from: [{
				address: 'from@mail',
				name: 'Some From'
			}],
			to: [{
				address: 'to@mail',
				name: 'Some To'
			}],
			cc: [{
				address: 'cc@mail',
				name: 'Some Cc'
			}],
			bcc: [{
				address: 'bcc@mail',
				name: 'Some Bcc'
			}],
			subject: 'Subject',
			body: 'Body',
			plainBody: 'Plain Data',
			bodyType: 'body/type',
			isSeen: true,
			attachments: [{ some: 'attachment' }]
		};
	}

	it('can create a mail from Writer form', () => {
		let formData = {
			subject: 'Subject',
			content: 'Content',
			recipients: [new Recipient(new Contact('some@mail'), 'to')]
		};
		let result: Mail = service.createFromWriter(formData);
		expect(result.from).toBeNull();
		expect(result.subject).toEqual('Subject');
		expect(result.body).toEqual('Content');
		expect(result.bodyType).toEqual('text/html');
		expect(result.recipients).toEqual(formData.recipients);
	});

	it('can create a mail from server data', () => {
		let serverData = testServerData();
		let result: Mail = service.createFromServerData([serverData])[0];
		expect(result.from.address).toEqual('from@mail');
		expect(result.from.name).toEqual('Some From');
		expect(result.recipients[0].address).toEqual('to@mail');
		expect(result.recipients[0].name).toEqual('Some To');
		expect(result.recipients[0].type).toEqual('to');
		expect(result.recipients[1].address).toEqual('cc@mail');
		expect(result.recipients[1].name).toEqual('Some Cc');
		expect(result.recipients[1].type).toEqual('cc');
		expect(result.subject).toEqual('Subject');
		expect(result.body).toEqual('Body');
		expect(result.bodyType).toEqual('body/type');
		expect(result.preview).toEqual('Plain Data');
		expect(result.isSeen).toEqual(true);
		expect(result.uid).toEqual(123);
		expect(result.messageId).toEqual('message-id');
		expect(result.date).toEqual(new Date(2017, 2, 2, 2, 2, 2));
	});

	it('can convert a mail to server data', () => {
		let myself = new Contact('me@mail');
		let to = new Recipient(new Contact('to@mail', 'Some To'), 'to');
		let cc = new Recipient(new Contact('cc@mail', 'Some Cc'), 'cc');
		let bcc = new Recipient(new Contact('bcc@mail', 'Some Bcc'), 'bcc');
		let recipients = [to, cc, bcc];
		let contents = {
			subject: 'Subject',
			body: 'Body',
			attachments: [{ some: 'attachment' }]
		};
		let flags = {
			isSeen: true
		};
		let metaData = {
			uid: 123,
			messageId: 'message-id',
			bodyType: 'body/type',
			date: new Date(2017, 2, 2, 2, 2, 2)
		};
		let mail = new Mail(myself, recipients, contents, flags, metaData);
		let serverData = service.toServerData(mail);
		let expected = testServerData();
		//TODO server is inconsistent in mail model for receiving and sending, one has a body, the other has a content. should fix.
		expected.content = expected.body;
		delete expected.plainBody;
		delete expected.body;
		delete expected.uid;
		delete expected.messageId;
		delete expected.date;
		delete expected.bodyType;
		delete expected.isSeen;
		delete expected.from;
		expect(serverData).toEqual(expected);
	});
});
