'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/operator/delay');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));
require('sinon-as-promised');

const SmtpService = require('./smtp-service');

describe('Smtp Service', () => {
	let smtpService;
	let client;
	let transport;
	let mail;

	let accountSettingsService;
	let accountSettingsObservable;
	let accountSettings = {
		mailAddress: 'my@mail',
		name: 'This Me',
		smtp: {
			host: 'some.host',
			port: 25,
			auth: {
				some: 'thing'
			}
		}
	};

	beforeEach(() => {
		transport = {
			sendMail: sinon.stub()
		};

		mail = {
			to: ['some@body'],
			cc: ['cc@body'],
			bcc: ['bcc@body'],
			subject: 'A subject',
			content: 'mail body'
		};

		client = {
			createTransport: sinon.stub().returns(transport)
		};

		accountSettingsObservable = rx.Observable.of(accountSettings);
		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(accountSettingsObservable);
		smtpService = new SmtpService(accountSettingsService, client);
	});

	describe('send', () => {
		it('throws when called without a mail argument', () => {
			expect(() => smtpService.send()).to.throw(smtpService.errors.mailArgumentMissing || '(error not defined)');
		});

		it('allows us to listen for completion of mail sending', () => {
			let observable = smtpService.send(mail);
			expect(observable).to.exist;
			expect(observable.subscribe).to.exist;
		});

		it('sets up the client with account settings', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(client.createTransport).to.have.been.calledWith({
					host: 'some.host',
					port: 25,
					auth: {
						some: 'thing'
					}
				}, {
					from: '"This Me" <my@mail>'
				});
				done();
			}, 20);
		});

		it('sends the mail and adds me to the bcc list', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(transport.sendMail).to.have.been.calledWith(sinon.match({
					to: ['some@body'],
					cc: ['cc@body'],
					bcc: [{
						name: 'This Me',
						address: 'my@mail'
					}, 'bcc@body'],
					subject: 'A subject',
					html: 'mail body'
				}), sinon.match.any);
				done();
			}, 20);
		});

		it('completes if sendMail ends without an error', done => {
			transport.sendMail.yields(null);
			smtpService.send(mail).subscribe(() => {
				done();
			}, done);
		});

		it('completes with error if sendMail ends with error', done => {
			transport.sendMail.yields(new Error('Some error'));
			smtpService.send(mail).subscribe(() => done(new Error('Should have failed.')), e => {
				expect(e.message).to.equal('Some error');
				done();
			});
		});
	});
});
