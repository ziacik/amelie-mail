'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const BodyStructure = require('./body-structure');

describe('BodyStructure', () => {
	let bodyStructure;

	beforeEach(() => {
		setupBasic();
	});

	function setupBasic() {
		bodyStructure = new BodyStructure({
			type: 'multipart',
			childNodes: [{
				id: 'plainid',
				part: '1.1',
				type: 'something/unknown'
			}, {
				id: '<bracketid>',
				part: '1.2',
				type: 'text/plain'
			}]
		});
	}

	it('preserves properties from source', () => {
		expect(bodyStructure.type).to.equal('multipart');
	});

	it('converts childNodes to BodyStructures', () => {
		expect(bodyStructure.childNodes[0]).to.be.an.instanceOf(BodyStructure);
		expect(bodyStructure.childNodes[1]).to.be.an.instanceOf(BodyStructure);
	});

	it('can accept a visitor', () => {
		let visitor = sinon.stub();
		delete bodyStructure.childNodes;
		bodyStructure.accept(visitor);
		expect(visitor).to.have.been.calledWith(bodyStructure);
	});

	it('will pass the visitor to child nodes', () => {
		let visitor = sinon.stub();
		sinon.spy(bodyStructure.childNodes[0], 'accept');
		sinon.spy(bodyStructure.childNodes[1], 'accept');
		bodyStructure.accept(visitor);
		expect(bodyStructure.childNodes[0].accept).to.have.been.calledWith(visitor);
		expect(bodyStructure.childNodes[1].accept).to.have.been.calledWith(visitor);
	});

	describe('findById', () => {
		it('returns undefined when a structure cannot be found', () => {
			let result = bodyStructure.findById('unknown');
			expect(result).not.to.exist;
		});

		it('can find a structure by id', () => {
			let result = bodyStructure.findById('plainid');
			expect(result).to.exist;
			expect(result.part).to.equal('1.1');
		});

		it('can find a structure by id even if it is in brackets', () => {
			let result = bodyStructure.findById('bracketid');
			expect(result).to.exist;
			expect(result.part).to.equal('1.2');
		});
	});

	describe('findAttachments', () => {
		function addAttachments() {
			bodyStructure.childNodes.push(new BodyStructure({
				part: '1.3',
				type: 'text/whatever',
				disposition: 'attachment'
			}));
		}

		it('returns empty array when there is no attachment structure', () => {
			let result = bodyStructure.findAttachments();
			expect(result).to.deep.equal([]);
		});

		it('can find attachments', () => {
			addAttachments();
			let result = bodyStructure.findAttachments();
			expect(result).to.exist;
			expect(result.length).to.equal(1);
			expect(result[0].part).to.equal('1.3');
		});
	});

	describe('findNonAttachmentByType', () => {
		function addAttachments() {
			bodyStructure.childNodes.push(new BodyStructure({
				part: '1.3',
				type: 'text/whatever',
				disposition: 'attachment'
			}));
		}

		it('returns undefined when there is no structure of requested type', () => {
			let result = bodyStructure.findNonAttachmentByType('unknown');
			expect(result).not.to.exist;
		});

		it('returns undefined when the structure of requested type is an attachment', () => {
			addAttachments();
			let result = bodyStructure.findNonAttachmentByType('text/whatever');
			expect(result).not.to.exist;
		});

		it('can find structure by type if it is not an attachment', () => {
			addAttachments();
			let result = bodyStructure.findNonAttachmentByType('text/plain');
			expect(result).to.exist;
			expect(result.part).to.equal('1.2');
		});
	});
});
