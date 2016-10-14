'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const ImapService = require('./imap-service');

describe('Imap Service', () => {
	let imapService;

	let imapLibrary;
	let accountSettingsService;
	let accountSettings = {
		login: 'fake.login'
	};

	beforeEach(() => {
		imapLibrary = sinon.stub();
		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(rx.Observable.of(accountSettings));
		imapService = new ImapService(imapLibrary, accountSettingsService);
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

	it('creates a new imap instance on listen', () => {
		let subscription = imapService.listen().subscribe();
		expect(imapLibrary).to.have.been.calledWith(accountSettings);
	});
});
