'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/operator/delay');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));
require('sinon-as-promised');

const ImapService = require('./imap-service');

describe('Imap Service', () => {
	let imapService;
	let ClientClass;
	let client;
	let codec;
	let inboxInfo;

	let accountSettingsService;
	let accountSettings = {
		imap: {
			host: 'some.host',
			port: 993,
			options: {
				some: 'option'
			}
		}
	};

	beforeEach(() => {
		inboxInfo = {
			exists: 123
		};

		client = {
			connect: sinon.stub().resolves(),
			listMessages: sinon.stub().resolves([]),
			selectMailbox: sinon.stub().resolves(inboxInfo),
			setFlags: sinon.stub().resolves()
		}

		codec = {
			base64Decode: sinon.stub().returnsArg(0),
			quotedPrintableDecode: sinon.stub().returnsArg(0)
		}

		ClientClass = sinon.stub().returns(client);

		accountSettingsService = {};
		accountSettingsService.getAll = sinon.stub().returns(rx.Observable.of(accountSettings).delay(1));
		imapService = new ImapService(accountSettingsService, ClientClass, codec);
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
				expect(ClientClass).to.have.been.calledWith('some.host', 993, {
					some: 'option'
				});
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
			beforeEach(() => {
				imapService.client = client;
			});

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

			it('allows setting a flag on a mail', done => {
				imapService.setFlag(123, '\\Seen').subscribe(() => {
					expect(client.setFlags).to.have.been.calledWith('INBOX', '123', {
						set: ['\\Seen']
					}, {
						byUid: true
					});
					done();
				});
			});

			it('allows removing a flag from a mail', done => {
				imapService.removeFlag(123, '\\Seen').subscribe(() => {
					expect(client.setFlags).to.have.been.calledWith('INBOX', '123', {
						remove: ['\\Seen']
					}, {
						byUid: true
					});
					done();
				});
			});

			describe('after listing messages', () => {
				let messages;
				let byUid = {
					byUid: true
				};

				beforeEach(() => {
					messages = [{
						uid: 1,
						bodystructure: {
							type: 'text/plain'
						},
						envelope: {}
					}, {
						uid: 2,
						bodystructure: {
							type: 'text/plain'
						},
						envelope: {}
					}, {
						uid: 3,
						bodystructure: {
							type: 'multipart',
							childNodes: [{
								part: '1.1',
								type: 'something/unknown'
							}, {
								part: '1.2',
								type: 'text/plain'
							}]
						},
						envelope: {}
					}, {
						uid: 4,
						bodystructure: {
							type: 'multipart',
							childNodes: [{
								part: '1.1',
								type: 'text/plain'
							}, {
								part: '1.2',
								type: 'text/html'
							}]
						},
						envelope: {}
					}];
					client.listMessages.onCall(0).resolves(messages);
				});

				it('should not fetch a plain text if there is none', done => {
					client.listMessages.onCall(0).resolves([{
						uid: 1,
						bodystructure: {
							type: 'something/unknown'
						},
						envelope: {}
					}]);
					imapService.listen().subscribe(() => {
						expect(client.listMessages).to.have.been.calledOnce;
						done();
					}, done);
				});

				it('should fetch plain text and html bodies of them', done => {
					imapService.listen().subscribe(() => {
						expect(client.listMessages).to.have.been.callCount(5);
						expect(client.listMessages).to.have.been.calledWith('INBOX', '1,2', ['uid', 'body.peek[1]'], byUid);
						expect(client.listMessages).to.have.been.calledWith('INBOX', '3', ['uid', 'body.peek[1.2]'], byUid);
						expect(client.listMessages).to.have.been.calledWith('INBOX', '4', ['uid', 'body.peek[1.1]'], byUid);
						expect(client.listMessages).to.have.been.calledWith('INBOX', '4', ['uid', 'body.peek[1.2]'], byUid);
						done();
					}, done);
				});

				describe('after fetching the bodies', () => {
					beforeEach(() => {
						messages = [{
							uid: 3,
							bodystructure: {
								type: 'multipart',
								childNodes: [{
									part: '1.1',
									type: 'text/html'
								}, {
									part: '1.2',
									type: 'text/plain'
								}]
							},
							envelope: {
								'message-id': 'message.id',
								'date': 'Fri, 13 Sep 2013 15:01:00 +0300',
								from: [{
									some: 'body'
								}],
								to: [{
									some: 'body'
								}],
								cc: [{
									another: 'body'
								}],
								subject: 'Some subject'
							}
						}];
						client.listMessages.onCall(0).resolves(messages);
						client.listMessages.onCall(1).resolves([{
							uid: 3,
							'body[1.2]': 'Some plain text'
						}]);
						client.listMessages.onCall(2).resolves([{
							uid: 3,
							'body[1.1]': '<p>Some html</p>'
						}]);
					});

					it('should create the mail structures and fill some basic envelope data', done => {
						imapService.listen().subscribe(mails => {
							expect(mails).to.exist;
							expect(mails.length).to.equal(1);
							let mail = mails[0];
							expect(mail.uid).to.equal(3);
							expect(mail.messageId).to.equal('message.id');
							expect(mail.subject).to.equal('Some subject');
							expect(mail.from).to.equal(messages[0].envelope.from);
							expect(mail.to).to.equal(messages[0].envelope.to);
							expect(mail.cc).to.equal(messages[0].envelope.cc);
							expect(mail.date).to.deep.equal(new Date(messages[0].envelope.date));
							done();
						}, done);
					});

					it('should decode the body from base64 and specified charset if base64 encoding set', done => {
						messages[0].bodystructure.childNodes[0].encoding = 'base64';
						messages[0].bodystructure.childNodes[0].parameters = {
							charset: 'somecharset'
						};

						codec.base64Decode = sinon.stub().returns('something decoded');

						imapService.listen().subscribe(mails => {
							expect(codec.base64Decode).to.have.been.calledWith('<p>Some html</p>', 'somecharset');
							let mail = mails[0];
							expect(mail.body).to.equal('something decoded');
							done();
						}, done);
					});

					it('should decode the body from quoted printable and specified charset if any other than base64 encoding set', done => {
						messages[0].bodystructure.childNodes[0].encoding = 'anything';
						messages[0].bodystructure.childNodes[0].parameters = {
							charset: 'somecharset'
						};

						codec.quotedPrintableDecode = sinon.stub().returns('something decoded');

						imapService.listen().subscribe(mails => {
							expect(codec.quotedPrintableDecode).to.have.been.calledWith('<p>Some html</p>', 'somecharset');
							let mail = mails[0];
							expect(mail.body).to.equal('something decoded');
							done();
						}, done);
					});

					it('should set html into body if there is one', done => {
						imapService.listen().subscribe(mails => {
							let mail = mails[0];
							expect(mail.body).to.equal('<p>Some html</p>');
							expect(mail.bodyType).to.equal('text/html');
							done();
						}, done);
					});

					it('should set plain text into body if there is no html', done => {
						messages[0].bodystructure.childNodes[0].type = 'something/else';
						imapService.listen().subscribe(mails => {
							let mail = mails[0];
							expect(mail.body).to.equal('Some plain text');
							expect(mail.bodyType).to.equal('text/plain');
							done();
						}, done);
					});

					it('should not flag the mail as isSeen if there is not a Seen flag', done => {
						imapService.listen().subscribe(mails => {
							expect(mails[0].isSeen).to.be.false;
							done();
						}, done);
					});

					it('should flag the mail as isSeen if there is a Seen flag', done => {
						messages[0].flags = ['\\Something', '\\Seen'];
						imapService.listen().subscribe(mails => {
							expect(mails[0].isSeen).to.be.true;
							done();
						}, done);
					});
				});

				describe('on new mail arrival', () => {
					it('should fetch it and update inbox info', done => {
						inboxInfo.exists = 0;
						imapService.listen().subscribe(mails => {
							expect(client.listMessages).to.have.been.calledWith('INBOX', '1:1');
							expect(client.listMessages).to.have.been.calledWith('INBOX', '33');
							expect(inboxInfo.exists).to.equal(1);
							expect(mails.length).to.equal(1);
							let mail = mails[0];
							expect(mail.body).to.equal('Some new mail');
							expect(mail.bodyType).to.equal('text/plain');
							done();
						}, done);

						setTimeout(() => {
							client.listMessages.onCall(0).resolves([{
								uid: 33,
								bodystructure: {
									type: 'text/plain'
								},
								envelope: {}
							}]);
							client.listMessages.onCall(1).resolves([{
								uid: 33,
								'body[1]': 'Some new mail'
							}]);

							if (client.onupdate) {
								client.onupdate('INBOX', 'exists', 1);
							}
						}, 100);
					});
				});
			});
		});
	});
});
