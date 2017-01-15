'use strict';

class Mail {
	constructor() {
		this.errors = {
			mustBeArray: what => `Array expected in ${what}.`
		};
	}

	withUid(uid) {
		this.uid = uid;
		return this;
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

	withBody(body) {
		this.body = body;
		return this;
	}

	withPreview(preview) {
		this.preview = preview;
		return this;
	}

	withBodyType(bodyType) {
		this.bodyType = bodyType;
		return this;
	}

	withIsSeen(isSeen) {
		this.isSeen = isSeen;
		return this;
	}
}

module.exports = Mail;
module.exports['@singleton'] = false;
module.exports['@require'] = [];
