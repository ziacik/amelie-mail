'use strict';

const EventEmitter = require('events').EventEmitter;

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));
require('sinon-as-promised');

const ImapService = require('./imap-service');

describe.only('Imap Service', () => {
	let imapService;
	let ClientClass;
	let client;

	let accountSettingsService;
	let accountSettings = {
		host: 'some.host',
		port: 993,
		options: {}
	};

	beforeEach(() => {
		client = {
			connect: sinon.stub().resolves(),
			listMessages: sinon.stub().resolves([])
		};
		ClientClass = sinon.stub().returns(client);
		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(rx.Observable.of(accountSettings));
		imapService = new ImapService(accountSettingsService, ClientClass);
	});

	it('allows us to listen for incoming mails', () => {
		let observable = imapService.listen();
		expect(observable).to.exist;
	});

	describe('listen', () => {
		it('allows us to subscribe for incoming mails', () => {
			let subscription = imapService.listen().subscribe();
			expect(subscription).to.exist;
		});

		it('can be unsubscribed from', () => {
			let subscription = imapService.listen().subscribe();
			expect(() => subscription.unsubscribe()).not.to.throw();
		});

		it('sets up the client with account settings', () => {
			imapService.listen().subscribe();
			expect(ClientClass).to.have.been.calledWith(accountSettings.host, accountSettings.port, accountSettings.options);
		});

		it('calls client.connect', () => {
			imapService.listen().subscribe();
			expect(client.connect).to.have.been.calledWith();
		});

		it('receives an error when connect fails', () => {
			let thrownError = new Error('Some Error.');
			client.connect.rejects(thrownError);
			return imapService.listen().catch(e => {
				expect(e).to.equal(thrownError);
				return [];
			}).subscribe(() => {
				throw new Error('Expected an error.');
			})
		});

		describe('when connected', () => {
			beforeEach(() => {});

			it('lists messages', () => {});
		});
	});
});
