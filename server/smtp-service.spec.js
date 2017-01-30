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
	let ClientClass;
	let client;
	let mail;

	let accountSettingsService;
	let accountSettingsObservable;
	let accountSettings = {
		mailAddress: 'my@mail',
		smtp: {
			host: 'some.host',
			port: 25,
			options: {
				some: 'thing'
			}
		}
	};

	beforeEach(() => {
		mail = {
			to: ['some@body'],
			cc: ['cc@body'],
			bcc: ['bcc@body'],
			subject: 'A subject',
			content: 'mail body'
		};

		client = {
			connect: sinon.stub(),
			useEnvelope: sinon.stub(),
			send: sinon.stub(),
			end: sinon.stub()
		};

		ClientClass = sinon.stub().returns(client);

		accountSettingsObservable = rx.Observable.of(accountSettings);
		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(accountSettingsObservable);
		smtpService = new SmtpService(accountSettingsService, ClientClass);
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
				expect(ClientClass).to.have.been.calledWith('some.host', 25, {
					some: 'thing'
				});
				done();
			}, 20);
		});

		it('connects', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(client.connect).to.have.been.called;
				done();
			}, 20);
		});

		it('must already be subscribed to onerror and onclose on connect', done => {
			client.connect = () => {
				expect(client.onerror).to.exist;
				expect(client.onclose).to.exist;
				done();
			};
			smtpService.send(mail).subscribe();
		});

		it('subscribes to an onerror event', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(client.onerror).to.exist;
				done();
			}, 20);
		});

		it('subscribes to an onclose event', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(client.onclose).to.exist;
				done();
			}, 20);
		});

		it('subscribes to an onidle event', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(client.onidle).to.exist;
				done();
			}, 20);
		});

		it('does not send envelope if onidle event didnt occur', done => {
			smtpService.send(mail).subscribe();
			setTimeout(() => {
				expect(client.useEnvelope).not.to.have.been.called;
				done();
			}, 20);
		});

		it('completes with error if onerror event occurs', done => {
			let error;
			setTimeout(() => client.onerror && client.onerror(new Error('Some error')), 1);
			setTimeout(() => client.onclose && client.onclose(true), 2);
			smtpService.send(mail).subscribe(null, e => error = e);
			setTimeout(() => {
				expect(error).to.exist;
				expect(error).to.be.an('error');
				expect(error.message).to.equal('Some error');
				done();
			}, 20);
		});

		it('completes with error if unexpected onclose event occurs', done => {
			let error;
			setTimeout(() => client.onclose && client.onclose(false), 1);
			smtpService.send(mail).subscribe(null, e => error = e);
			setTimeout(() => {
				expect(error).to.exist;
				expect(error).to.be.an('error');
				expect(error.message).to.equal('Unexpected close');
				done();
			}, 20);
		});

		describe('after onidle event', () => {
			beforeEach(() => {
				smtpService.Client = sinon.spy(() => {
					setTimeout(() => client.onidle && client.onidle(), 1);
					return client;
				});
			});

			it('sends an envelope', done => {
				smtpService.send(mail).subscribe();
				setTimeout(() => {
					expect(client.useEnvelope).to.have.been.calledWith({
						from: 'my@mail',
						to: ['some@body', 'cc@body', 'bcc@body']
					});
					done();
				}, 20);
			});

			it('only sends envelope once when multiple onidle events occur', done => {
				smtpService.Client = sinon.spy(() => {
					setTimeout(() => client.onidle(), 1);
					setTimeout(() => client.onidle && client.onidle(), 2);
					setTimeout(() => client.onidle && client.onidle(), 4);
					return client;
				});
				smtpService.send(mail).subscribe();
				setTimeout(() => {
					expect(client.useEnvelope).to.have.been.calledWith({
						from: 'my@mail',
						to: ['some@body', 'cc@body', 'bcc@body']
					});
					done();
				}, 20);
			});

			it('subscribes to onready event', done => {
				smtpService.send(mail).subscribe();
				setTimeout(() => {
					expect(client.onready).to.exist;
					done();
				}, 20);
			});

			it('does not send a mail if onready event didnt occur', done => {
				smtpService.send(mail).subscribe();
				setTimeout(() => {
					expect(client.send).not.to.have.been.called;
					done();
				}, 20);
			});

			it('completes with error if onerror event occurs', done => {
				let error;
				setTimeout(() => client.onerror && client.onerror(new Error('Some error')), 1);
				setTimeout(() => client.onclose && client.onclose(true), 2);
				smtpService.send(mail).subscribe(null, e => error = e);
				setTimeout(() => {
					expect(error).to.exist;
					expect(error).to.be.an('error');
					expect(error.message).to.equal('Some error');
					done();
				}, 20);
			});

			describe('after onready event', () => {
				beforeEach(() => {
					client.useEnvelope = () => {
						setTimeout(() => client.onready && client.onready(), 1);
					};
				});

				it('sends a mail and calls end', done => {
					smtpService.send(mail).subscribe();
					setTimeout(() => {
						expect(client.send).to.have.been.calledWith('Subject: A subject\n');
						expect(client.send).to.have.been.calledWith('\n');
						expect(client.send).to.have.been.calledWith('mail body');
						expect(client.end).to.have.been.called;
						done();
					}, 20);
				});

				it('subscribes to ondone event', done => {
					smtpService.send(mail).subscribe();
					setTimeout(() => {
						expect(client.ondone).to.exist;
						done();
					}, 20);
				});

				it('does not complete the subscription if ondone event didnt occur', done => {
					let completed = 'not completed';
					smtpService.send(mail).subscribe(null, done, () => completed = 'completed');
					setTimeout(() => {
						expect(completed).to.equal('not completed');
						done();
					}, 20);
				});

				it('completes with error if onerror event occurs', done => {
					let error;
					setTimeout(() => client.onerror && client.onerror(new Error('Some error')), 1);
					setTimeout(() => client.onclose && client.onclose(true), 2);
					smtpService.send(mail).subscribe(null, e => error = e);
					setTimeout(() => {
						expect(error).to.exist;
						expect(error).to.be.an('error');
						expect(error.message).to.equal('Some error');
						done();
					}, 20);
				});

				describe('after ondone event', () => {
					let onDoneResult;

					beforeEach(() => {
						onDoneResult = true;
						client.end = () => {
							setTimeout(() => client.ondone && client.ondone(onDoneResult), 1);
							setTimeout(() => client.onclose && client.onclose(false), 2);
						};
					});

					it('completes without error if onDone triggers with true', done => {
						let completed = 'not completed';
						smtpService.send(mail).subscribe(null, done, () => completed = 'completed');
						setTimeout(() => {
							expect(completed).to.equal('completed');
							done();
						}, 20);
					});

					it('completes with error if onDone triggers with false', done => {
						let error;
						onDoneResult = false;
						smtpService.send(mail).subscribe(null, e => error = e);
						setTimeout(() => {
							expect(error).to.exist;
							expect(error).to.be.an('error');
							expect(error.message).to.equal(smtpService.errors.errorSendingMail || '(error not defined)');
							done();
						}, 20);
					});
				});
			});
		});
	});
});
