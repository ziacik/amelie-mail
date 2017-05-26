'use strict';

class BodyStructure {
	constructor(source) {
		Object.assign(this, source);
		this._initChildNodes();
	}

	attachmentName() {
		if (this.name) {
			return this.name;
		}

		if (this.parameters && this.parameters.name) {
			return this.parameters.name;
		}

		if (this.dispositionParameters && this.dispositionParameters.filename) {
			return this.dispositionParameters.filename;
		}

		if (this.envelope && this.envelope.subject) {
			return this.envelope.subject;
		}

		return 'attachment';
	}

	accept(visitor) {
		visitor(this);

		if (this.childNodes && !this.isAttachment()) {
			this.childNodes.forEach(childNode => childNode.accept(visitor));
		}
	}

	findById(id) {
		let result;
		let visitor = structure => {
			if (structure.id === id || structure.id === `<${id}>`) {
				result = structure;
			}
		};
		this.accept(visitor);
		return result;
	}

	findAttachments() {
		let result = [];
		let visitor = structure => {
			if (structure.isAttachment()) {
				result.push(structure);
			}
		}
		this.accept(visitor);
		return result;
	}

	findNonAttachmentByType(type) {
		let result;
		let visitor = structure => {
			// TODO Review: the !result part is because there can be a mail with more than 1 text/html parts. However, not sure how should we decide which to choose. The mail I seen had the first one good and the second was an empty html.
			if (!result && structure.type === type && !structure.isAttachment()) {
				result = structure;
			}
		};
		this.accept(visitor);
		return result;
	}

	_initChildNodes() {
		if (this.childNodes) {
			this.childNodes = this.childNodes.map(it => new BodyStructure(it));
		}
	}

	isAttachment() {
		return this.disposition === 'attachment';
	}
}

module.exports = BodyStructure;
