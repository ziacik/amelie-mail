'use strict';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const ImapService = require('./imap-service');

describe('Imap Service', () => {
	let imapService;

	beforeEach(() => {
		imapService = new ImapService();
	});

	it('allows us to listen for incoming mails', () => {
		let observable = imapService.listen();
		expect(observable).to.exist;
	});

	it('allows us to subscribe for incoming mails', () => {
		let subscription = imapService.listen().subscribe();
		expect(subscription).to.exist;
	});

	it('allows us to unsubscribe from incoming mails', () => {
		let subscription = imapService.listen().subscribe();
		expect(() => subscription.unsubscribe()).not.to.throw();
	});

	it('creates a new imap connection on listen', () => {
		imapService.connect = sinon.spy();
		imapService.listen();
		expect(imapService.connect).to.have.been.called;
	});
})
