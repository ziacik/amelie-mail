'use strict';

class BodyStructure {
	constructor(source) {
		Object.assign(this, source);
		this._initChildNodes();
	}

	accept(visitor) {
		visitor(this);
		if (this.childNodes) {
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
			if (structure.disposition === 'attachment') {
				result.push(structure);
			}
		}
		this.accept(visitor);
		return result;
	}

	findNonAttachmentByType(type) {
		let result;
		let visitor = structure => {
			if (structure.type === type && structure.disposition !== 'attachment') {
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
}

module.exports = BodyStructure;
