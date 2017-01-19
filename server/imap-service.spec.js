'use strict';

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
	let inboxInfo;

	let accountSettingsService;
	let accountSettings = {
		host: 'some.host',
		port: 993,
		options: {}
	};

	beforeEach(() => {
		inboxInfo = {
			exists: 123
		};

		client = {
			connect: sinon.stub().resolves(),
			listMessages: sinon.stub().resolves([]),
			selectMailbox: sinon.stub().resolves(inboxInfo)
		}

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
		it('allows us to subscribe for incoming mails', done => {
			let subscription = imapService.listen().subscribe(() => {
				expect(subscription).to.exist;
				done();
			}, done);
		});

		it('can be unsubscribed from', done => {
			let subscription = imapService.listen().subscribe(() => {
				expect(() => subscription.unsubscribe()).not.to.throw();
				done();
			}, done);
		});

		it('sets up the client with account settings', done => {
			imapService.listen().subscribe(() => {
				expect(ClientClass).to.have.been.calledWith(accountSettings.host, accountSettings.port, accountSettings.options);
				done();
			}, done);
		});

		it('calls client.connect', done => {
			imapService.listen().subscribe(() => {
				expect(client.connect).to.have.been.calledWith();
				done();
			}, done);
		});

		it('receives an error when connect fails', done => {
			let thrownError = new Error('Some Error.');
			client.connect.rejects(thrownError);
			return imapService.listen().catch(e => {
				expect(e).to.equal(thrownError);
				done();
				return [];
			}).subscribe(() => {
				done(new Error('Expected an error.'));
			})
		});

		describe('when connected', () => {
			it('selects an INBOX mailbox', done => {
				imapService.listen().subscribe(() => {
					expect(client.selectMailbox).to.have.been.calledWith('INBOX');
					done();
				}, done);
			});

			it('does not initially list any messages if there are none', done => {
				inboxInfo.exists = 0;
				imapService.listen().subscribe(() => {}, done);
				setTimeout(() => {
					expect(client.listMessages).not.to.have.been.called;
					done();
				}, 100);
			});

			it('initially lists newest 100 messages in the mailbox', done => {
				imapService.listen().subscribe(() => {
					expect(client.listMessages).to.have.been.calledWith('INBOX', '23:*', ['uid', 'flags', 'envelope', 'bodystructure']);
					done();
				}, done);
			});

			it('initially lists all of the messages if there are less than or equal 100 of them in the mailbox', done => {
				inboxInfo.exists = 100;
				imapService.listen().subscribe(() => {
					expect(client.listMessages).to.have.been.calledWith('INBOX', '*', ['uid', 'flags', 'envelope', 'bodystructure']);
					done();
				}, done);
			});
		});
	});
});
