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

		return this._loadCidAttachments(cids).flatMap(attachments => {
			if (attachments.length) {
				mail.attachments = (mail.attachments || []).concat(attachments);
			}

			return this.smtpService.send(mail);
		});
	}

	_getCids(html) {
		let result = [];
		let cidRegex = /="cid:(.*?)"/g;
		let match = cidRegex.exec(html);
		while (match) {
			let cid = match[1];
			result.push(cid);
			match = cidRegex.exec(html)
		}
		return result;
	}

	_loadCidAttachments(cids) {
		if (!cids.length) {
			return Rx.Observable.of([]);
		}

		let attachmentRequests = cids.map(cid => this.imapService.getAttachment(cid).catch(() => Rx.Observable.of(null)).map(content => {
			return content == null ? null : {
				cid: cid,
				content: Buffer.from(content)
			};
		}));

		return Rx.Observable.forkJoin(attachmentRequests).map(attachments => attachments.filter(it => it));
	}
}

module.exports = SenderService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['smtp-service', 'imap-service'];
