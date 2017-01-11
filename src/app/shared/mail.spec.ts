import {Mail} from './mail';

describe('Mail', () => {
	let mail;

	beforeEach(() => {
		mail = new Mail();
	});

	it('can have an uid', () => {
		let result = mail.withUid('uid');
		expect(mail.uid).toEqual('uid');
		expect(result).toEqual(mail);
	});

	it('can have a messageId', () => {
		let result = mail.withMessageId('message@id');
		expect(mail.messageId).toEqual('message@id');
		expect(result).toEqual(mail);
	});

	it('can have a from', () => {
		let result = mail.withFrom(['one', 'two']);
		expect(mail.from).toEqual(['one', 'two']);
		expect(result).toEqual(mail);
	})

	it('can have a to', () => {
		let result = mail.withTo(['one', 'two']);
		expect(mail.to).toEqual(['one', 'two']);
		expect(result).toEqual(mail);
	})

	it('can have a subject', () => {
		let result = mail.withSubject('Some subject');
		expect(mail.subject).toEqual('Some subject');
		expect(result).toEqual(mail);
	})

	it('can have a bodyType', () => {
		let result = mail.withBodyType('text/html');
		expect(mail.bodyType).toEqual('text/html');
		expect(result).toEqual(mail);
	})

	it('can have a body', () => {
		let result = mail.withBody('Some body.');
		expect(mail.body).toEqual('Some body.');
		expect(result).toEqual(mail);
	})
});
