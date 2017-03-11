'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/operator/delay');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));
require('sinon-as-promised');

const AttachmentDecoder = require('./attachment-decoder');

describe('Attachment Decoder', () => {
	let attachmentDecoder;

	beforeEach(() => {
		attachmentDecoder = new AttachmentDecoder();
	});

	it('throws when decode called without data', () => {
		expect(() => attachmentDecoder.decode(undefined, 'whatever')).to.throw(attachmentDecoder.errors.dataArgumentMissing())
	});

	it('throws when decode called without encoding', () => {
		expect(() => attachmentDecoder.decode('whatever')).to.throw(attachmentDecoder.errors.encodingArgumentMissing())
	});

	describe('with base64 data', () => {
		let data;

		beforeEach(() => {
			data = 'UsO6cmEgamUgZG9tYQ==';
		});

		it('decodes to a buffer', () => {
			return attachmentDecoder.decode(data, 'base64').then(result => {
				expect(result).to.be.an.instanceOf(Buffer);
				expect(result.toString('hex')).to.equal('52c3ba7261206a6520646f6d61');
			});
		});
	});

	describe('with quoted printable data', () => {
		let data;

		beforeEach(() => {
			data = 'R=C3=BAra je doma';
		});

		it('decodes to a buffer', () => {
			return attachmentDecoder.decode(data, 'quoted-printable').then(result => {
				expect(result).to.be.an.instanceOf(Buffer);
				expect(result.toString('hex')).to.equal('52c3ba7261206a6520646f6d61');
			});
		});
	});

	describe('with data encoded with some unknown encoding', () => {
		let data;

		beforeEach(() => {
			data = 'Rúra je doma';
		});

		it('decodes to a original data in a buffer', () => {
			return attachmentDecoder.decode(data, 'unknown-encoding').then(result => {
				expect(result).to.be.an.instanceOf(Buffer);
				expect(result.toString('hex')).to.equal('52c3ba7261206a6520646f6d61');
			});
		});
	});
});
