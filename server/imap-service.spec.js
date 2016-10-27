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
const imap = require('imap-simple');

describe('Imap Service', () => {
	let imapService;

	let imapConstructor;
	let accountSettingsService;
	let accountSettings = {
		login: 'fake.login'
	};

	beforeEach(() => {
		sinon.stub(imap, 'connect').resolves();
		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(rx.Observable.of(accountSettings));
		imapService = new ImapService(imap, accountSettingsService);
	});

	afterEach(() => {
		imap.connect.restore();
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

		it('calls imap.connect', () => {
			imapService.listen().subscribe();
			expect(imap.connect).to.have.been.calledWith(accountSettings);
		});

		it('receives an error when connect fails', () => {
			let thrownError = new Error('Some Error.');
			imap.connect.rejects(thrownError);
			return imapService.listen().catch(e => {
				expect(e).to.equal(thrownError);
				return [];
			}).subscribe(() => {
				throw new Error('Expected an error.');
			})
		});

		it('opens inbox', () => {
			
		});

		describe('when connected', () => {
			let subscription;
			let mailStream;
			let inboxStub;

			beforeEach(() => {
				imapStub.connect = sinon.stub();
				imapStub.openBox = sinon.stub();
				mailStream = sinon.stub();
				subscription = imapService.listen().subscribe(mailStream);
				imapStub.emit('ready');
			});

			it('opens inbox', () => {
				expect(imapStub.openBox).to.have.been.calledWith('INBOX');
			});

			describe('when inbox is open', () => {
				beforeEach(() => {

				});

				it('fetches all headers', () => {

				});
			})
		});
	});
});
