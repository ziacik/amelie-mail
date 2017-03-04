'use strict';

require('./rxjs-operators');
const Rx = require('rxjs');

class SenderService {
	constructor(smtpService, imapService) {
		this.errors = {
			mailArgumentMissing: () => 'Mail argument missing'
		};
		this.smtpService = smtpService;
		this.imapService = imapService;
	}

	send(mail) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}

		let cids = this._getCids(mail.content);
		return this._loadCidAttachments(cids)
			.flatMap(attachments => this._sendWithAttachments(mail, attachments));
	}

	_sendWithAttachments(mail, attachments) {
		if (attachments.length) {
			mail.attachments = (mail.attachments || []).concat(attachments);
		}

		return this.smtpService.send(mail);
	}

	_getCids(html) {
		let cids = [];
		let cidRegex = /="cid:(.*?)"/g;
		let match = cidRegex.exec(html);

		while (match) {
			let cid = match[1];
			cids.push(cid);
			match = cidRegex.exec(html)
		}

		return cids;
	}

	_loadCidAttachments(cids) {
		if (!cids.length) {
			return Rx.Observable.of([]);
		}

		let attachmentRequests = cids.map(cid => this._getAttachmentContentOrNull(cid));

		return Rx.Observable.forkJoin(attachmentRequests)
			.map(attachments => attachments.filter(it => it));
	}

	_getAttachmentContentOrNull(cid) {
		return this.imapService
			.getAttachment(cid)
			.catch(() => Rx.Observable.of(null))
			.map(content => this._createAttachmentOrNull(cid, content));
	}

	_createAttachmentOrNull(cid, content) {
		if (!content) {
			return null;
		}

		return {
			cid: cid,
			content: Buffer.from(content)
		};
	}
}

module.exports = SenderService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['smtp-service', 'imap-service'];
