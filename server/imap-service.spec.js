'use strict';

const EventEmitter = require('events').EventEmitter;

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const ImapService = require('./imap-service');

describe('Imap Service', () => {
	let imapService;

	let imapConstructor;
	let accountSettingsService;
	let accountSettings = {
		login: 'fake.login'
	};

	let imapStub;

	beforeEach(() => {
		imapStub = new EventEmitter();
		imapStub.connect = sinon.stub();
		imapConstructor = sinon.stub().returns(imapStub);
		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(rx.Observable.of(accountSettings));
		imapService = new ImapService(imapConstructor, accountSettingsService);
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

		it('creates a new imap instance', () => {
			let subscription = imapService.listen().subscribe();
			expect(imapConstructor).to.have.been.calledWith(accountSettings);
		});

		it('calls imap.connect and subscribes to imap ready and error events on listen', () => {
			imapStub.addListener = sinon.stub();
			imapService.listen().subscribe();
			expect(imapStub.connect).to.have.been.calledWith();
			expect(imapStub.addListener).to.have.been.calledWith('ready');
			expect(imapStub.addListener).to.have.been.calledWith('error');
		});

		it('passes an error event to the subscription', () => {
			let observable = imapService.listen();
			let thrownError = new Error('Some Error.');
			let catchedError = null;
			observable.catch(e => {
				catchedError = e;
				return [];
			}).subscribe(() => {});
			imapStub.emit('error', thrownError);
			expect(catchedError).to.equal(thrownError);
		});

		describe('when ready', () => {
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
		});
	});
});