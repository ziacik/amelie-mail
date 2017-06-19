import { Mail } from './mail';
import { Contact } from './contact';
import { Recipient } from './recipient';

describe('Mail', () => {
	let mail: Mail;
	let from: Contact;
	let recipients: Recipient[];
	let contents: any;
	let flags: any;
	let metaData: any;

	beforeEach(() => {
		from = new Contact('some.from');
		recipients = [new Recipient(from, 'to')];
		contents = {
			subject: 'Subject',
			body: 'Body',
			preview: 'Preview'
		};
		flags = {
			isSeen: true
		};
		metaData = {
			uid: 123,
			messageId: 'messageId',
			date: new Date(2017, 4, 5, 12, 40, 0),
			bodyType: 'text/html'
		};
		mail = new Mail(from, recipients, contents, flags, metaData);
	});

	it('has from and recipients', () => {
		expect(mail.from).toEqual(from);
		expect(mail.recipients).toEqual(recipients);
	});

	it('can have meta data', () => {
		expect(mail.messageId).toEqual('messageId');
		expect(mail.uid).toEqual(123);
		expect(mail.date).toEqual(new Date(2017, 4, 5, 12, 40, 0));
		expect(mail.bodyType).toEqual('text/html');
	});

	it('can have subject, body and preview', () => {
		expect(mail.subject).toEqual('Subject');
		expect(mail.body).toEqual('Body');
		expect(mail.preview).toEqual('Preview');
	})
});
