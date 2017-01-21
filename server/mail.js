'use strict';

class Mail {
	constructor(uid) {
		this.uid = uid;
		this.errors = {
			mustBeArray: what => `Array expected in ${what}.`,
			missingBodyType: 'Missing bodyType argument'
		};
	}

	withMessageId(messageId) {
		this.messageId = messageId;
		return this;
	}

	withFrom(from) {
		if (!Array.isArray(from)) {
			throw new Error(this.errors.mustBeArray('from'));
		}

		this.from = from;
		return this;
	}

	withTo(to) {
		if (!Array.isArray(to)) {
			throw new Error(this.errors.mustBeArray('to'));
		}

		this.to = to;
		return this;
	}

	withSubject(subject) {
		this.subject = subject;
		return this;
	}

	withBody(body, bodyType) {
		if (!bodyType) {
			throw new Error(this.errors.missingBodyType);
		}

		this.body = body;
		this.bodyType = bodyType;

		if (bodyType === 'text/plain') {
			this.preview = this._calculatePreview(body);
		}

		return this;
	}

	withIsSeen(isSeen) {
		this.isSeen = isSeen;
		return this;
	}

	_calculatePreview(body) {
		if (!body || body.length <= 200) {
			return body;
		}

		let lastDotIndex = body.lastIndexOf('.', 200);

		if (lastDotIndex >= 150) {
			return body.substr(0, lastDotIndex + 1);
		} else {
			return body.substr(0, 199) + '…';
		}
	}
}

module.exports = Mail;
module.exports['@singleton'] = false;
module.exports['@require'] = [];
