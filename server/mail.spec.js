'use strict';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const Mail = require('./mail');

describe.only('Mail', () => {
	let mail;

	beforeEach(() => {
		mail = new Mail();
	});

	it('can have an uid', () => {
		let result = mail.withUid('uid');
		expect(mail.uid).to.equal('uid');
		expect(result).to.equal(mail);
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

	it('can have a subject', () => {
		let result = mail.withSubject('Some subject');
		expect(mail.subject).to.equal('Some subject');
		expect(result).to.equal(mail);
	})

	it('can have a bodyType', () => {
		let result = mail.withBodyType('text/html');
		expect(mail.bodyType).to.equal('text/html');
		expect(result).to.equal(mail);
	})

	it('can have a body', () => {
		let result = mail.withBody('Some body.');
		expect(mail.body).to.equal('Some body.');
		expect(result).to.equal(mail);
	})
});
