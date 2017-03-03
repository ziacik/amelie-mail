'use strict';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));
require('sinon-as-promised');

const SenderService = require('./sender-service');

describe.only('Sender Service', () => {
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
			send: sinon.stub()
		};
		imapService = {};
		service = new SenderService(smtpService, imapService);
	});

	describe('send', () => {
		it('throws when called without a mail argument', () => {
			expect(() => service.send()).to.throw(service.errors.mailArgumentMissing());
		});

		it('adds all cid references as attachments', () => {
			mail.content = 'Some <img src="cid:123;xyz"> <img src="cid:abc@xyz"> thing';
			service.send(mail);
			expect(mail.attachments).to.exist;
			expect(mail.attachments.length).to.equal(2);
			expect(mail.attachments[0]).to.deep.equal({
				path: 'cid:123;xyz',
				cid: '123;xyz'
			});
			expect(mail.attachments[1]).to.deep.equal({
				path: 'cid:abc@xyz',
				cid: 'abc@xyz'
			});
		});

		it('calls smtpService.send and passes the result through', () => {
			let expectedResult = {};
			smtpService.send.returns(expectedResult);
			let result = service.send(mail);
			expect(result).to.equal(expectedResult);
			expect(smtpService.send).to.have.been.calledWith(mail);
		});
	});
});
