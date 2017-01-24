'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const Mail = require('./mail');

describe.only('Mail', () => {
	let mail;

	beforeEach(() => {
		mail = new Mail(123);
	});

	it('must have an uid', () => {
		expect(mail.uid).to.equal(123);
	});

	it('can have a messageId', () => {
		let result = mail.withMessageId('message@id');
		expect(mail.messageId).to.equal('message@id');
		expect(result).to.equal(mail);
	});

	it('fails when setting a from that is not an array', () => {
		expect(() => mail.withFrom('from')).to.throw(mail.errors.mustBeArray('from'));
	});

	it('fails when setting a to that is not an array', () => {
		expect(() => mail.withTo('to')).to.throw(mail.errors.mustBeArray('to'));
	});

	it('fails when setting a cc that is not an array', () => {
		expect(() => mail.withCc('cc')).to.throw(mail.errors.mustBeArray('cc'));
	});

	it('fails when setting date that is not a date', () => {
		expect(() => mail.withDate('kva')).to.throw(mail.errors.mustBeDate('date'));
	});

	it('can have a from', () => {
		let result = mail.withFrom(['one', 'two']);
		expect(mail.from).to.deep.equal(['one', 'two']);
		expect(result).to.equal(mail);
	})

	it('can have a to', () => {
		let result = mail.withTo(['one', 'two']);
		expect(mail.to).to.deep.equal(['one', 'two']);
		expect(result).to.equal(mail);
	})

	it('can have a cc', () => {
		let result = mail.withCc(['one', 'two']);
		expect(mail.cc).to.deep.equal(['one', 'two']);
		expect(result).to.equal(mail);
	})

	it('can have a subject', () => {
		let result = mail.withSubject('Some subject');
		expect(mail.subject).to.equal('Some subject');
		expect(result).to.equal(mail);
	})

	it('fails when withBody called without a bodyType', () => {
		expect(() => mail.withBody('Something')).to.throw(mail.errors.missingBodyType || '(error not defined)');
	});

	it('can have a body and bodyType', () => {
		let result = mail.withBody('Some body.', 'text/html');
		expect(mail.body).to.equal('Some body.');
		expect(mail.bodyType).to.equal('text/html');
		expect(result).to.equal(mail);
	})

	it('can be seen or not seen', () => {
		let result = mail.withIsSeen(true);
		expect(mail.isSeen).to.equal(true);
		expect(result).to.equal(mail);
	})

	it('should set a plainBody from plain text body', () => {
		mail.withBody('Some plain text', 'text/plain');
		expect(mail.plainBody).to.equal('Some plain text');
	});

	it('should not set a plainBody from html if already set from plain text', () => {
		mail.withBody('Some text', 'text/plain');
		mail.withBody('Some html', 'text/html');
		expect(mail.plainBody).to.equal('Some text');
	});

	it('should replace plainBody if another plain text body set', () => {
		mail.withBody('Some text', 'text/plain');
		mail.withBody('Another text', 'text/plain');
		expect(mail.plainBody).to.equal('Another text');
	});

	it('should extract text from html to plainBody not already set', () => {
		mail.withBody('<html><head><title>Some title</title></head><body><p>Some text</p><div>Another text</div></body></html>', 'text/html');
		expect(mail.plainBody).to.equal('Some text Another text');
	});
});
