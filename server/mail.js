'use strict';

const cheerio = require('cheerio');

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

		if (!this.plainBody || bodyType === 'text/plain') {
			this.plainBody = this._getPlainText(body, bodyType);
		}

		return this;
	}

	withIsSeen(isSeen) {
		this.isSeen = isSeen;
		return this;
	}

	_getPlainText(body, bodyType) {
		if (bodyType === 'text/plain') {
			return body;
		} else if (bodyType === 'text/html') {
			return this._htmlToText(body);
		}
	}

	_htmlToText(body) {
		let $ = cheerio.load(body);
		return $('body *').contents().map(function() {
			return (this.type === 'text') ? $(this).text() + ' ' : '';
		}).get().join('').trim();
	}
}

module.exports = Mail;
module.exports['@singleton'] = false;
module.exports['@require'] = [];
