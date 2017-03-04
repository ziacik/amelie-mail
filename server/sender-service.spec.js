'use strict';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));
require('sinon-as-promised');

const Rx = require('rxjs');
const SenderService = require('./sender-service');

describe('Sender Service', () => {
	let service;
	let smtpService;
	let imapService;
	let mail;

	beforeEach(() => {
		mail = {
			to: ['some@body'],
			cc: ['cc@body'],
			bcc: ['bcc@body'],
			subject: 'A subject',
			content: 'mail body'
		};
		smtpService = {
			send: sinon.stub().returns(Rx.Observable.of(1))
		};
		imapService = {
			getAttachment: sinon.stub()
		};
		service = new SenderService(smtpService, imapService);
	});

	describe('send', () => {
		it('throws when called without a mail argument', () => {
			expect(() => service.send()).to.throw(service.errors.mailArgumentMissing());
		});

		it('retrieves all cid attachments from imap and adds them as new attachments, ignoring errors', done => {
			imapService.getAttachment.withArgs('123;xyz').returns(Rx.Observable.of([1, 2]));
			imapService.getAttachment.withArgs('abc@xyz').returns(Rx.Observable.of([3, 4]));
			imapService.getAttachment.withArgs('unknown').returns(Rx.Observable.throw(new Error('Something')));
			mail.content = 'Some <img src="cid:123;xyz"> <img src="cid:abc@xyz"> <img src="cid:unknown"> thing';
			service.send(mail).subscribe(() => {
				expect(mail.attachments).to.exist;
				expect(mail.attachments.length).to.equal(2);
				expect(mail.attachments[0]).to.deep.equal({
					cid: '123;xyz',
					content: Buffer.from([1, 2])
				});
				expect(mail.attachments[1]).to.deep.equal({
					cid: 'abc@xyz',
					content: Buffer.from([3, 4])
				});
				done();
			}, done);
		});

		it('does not replace existing attachments with cid attachments, concats them instead', done => {
			imapService.getAttachment.withArgs('123;xyz').returns(Rx.Observable.of([1, 2]));
			mail.content = 'Some <img src="cid:123;xyz"> thing';
			mail.attachments = [{
				some: 'thing'
			}, {
				cid: '2'
			}];
			service.send(mail).subscribe(() => {
				expect(mail.attachments).to.exist;
				expect(mail.attachments).to.deep.equal([{
					some: 'thing'
				}, {
					cid: '2'
				}, {
					cid: '123;xyz',
					content: Buffer.from([1, 2])
				}]);
				done();
			}, done);
		});

		it('calls smtpService.send and passes the result through', done => {
			let expectedResult = {};
			smtpService.send.returns(Rx.Observable.of(expectedResult));
			service.send(mail).subscribe(result => {
				expect(result).to.equal(expectedResult);
				expect(smtpService.send).to.have.been.calledWith(mail);
				done();
			}, done);
		});
	});
});
