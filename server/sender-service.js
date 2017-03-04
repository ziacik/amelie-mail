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

		let excids = this._getAndConvertExCids(mail);
		return this._loadCidAttachments(excids)
			.flatMap(attachments => this._sendWithAttachments(mail, attachments));
	}

	_sendWithAttachments(mail, attachments) {
		if (attachments.length) {
			mail.attachments = (mail.attachments || []).concat(attachments);
		}

		return this.smtpService.send(mail);
	}

	_getAndConvertExCids(mail) {
		let excids = [];
		mail.content = mail.content.replace(/="excid:(.*?)"/g, (match, excid) => {
			excids.push(excid);
			let cid = this._getCidFromExCid(excid);
			return cid ? `="cid:${cid}"` : '=""';
		});
		return excids;
	}

	_loadCidAttachments(excids) {
		if (!excids.length) {
			return Rx.Observable.of([]);
		}

		let attachmentRequests = excids.map(excid => this._getAttachmentContentOrNull(excid));

		return Rx.Observable.forkJoin(attachmentRequests)
			.map(attachments => attachments.filter(it => it));
	}

	_getAttachmentContentOrNull(excid) {
		return this.imapService
			.getAttachment(excid)
			.catch(() => Rx.Observable.of(null))
			.map(content => this._createAttachmentOrNull(excid, content));
	}

	_createAttachmentOrNull(excid, content) {
		if (!content) {
			return null;
		}

		return {
			cid: this._getCidFromExCid(excid),
			content: Buffer.from(content)
		};
	}

	_getCidFromExCid(excid) {
		return excid.split(';')[0];
	}
}

module.exports = SenderService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['smtp-service', 'imap-service'];
