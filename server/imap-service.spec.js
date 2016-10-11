'use strict';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));

require('sinon-as-promised');

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
		accountSettingsService.getAll = sinon.stub().resolves(accountSettings);
		imapService = new ImapService(imapLibrary, accountSettingsService);
	});

	it('allows us to listen for incoming mails', () => {
		let observable = imapService.listen();
		expect(observable).to.exist;
	});

	it('allows us to subscribe for incoming mails', () => {
		return imapService.listen().then(observable => {
			let subscription = observable.subscribe();
			expect(subscription).to.exist;
		});
	});

	it('allows us to unsubscribe from incoming mails', () => {
		return imapService.listen().then(observable => {
			let subscription = observable.subscribe();
			expect(() => subscription.unsubscribe()).not.to.throw();
		});
	});

	it('creates a new imap instance on listen', () => {
		return imapService.listen().then(() => {
			expect(imapLibrary).to.have.been.calledWith(accountSettings);
		});
	});
})
