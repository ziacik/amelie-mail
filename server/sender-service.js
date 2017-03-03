'use strict';

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

		let cidAttachments = this._getCidAttachments(mail.content);

		if (cidAttachments.length) {
			mail.attachments = cidAttachments;
		}

		return this.smtpService.send(mail);
	}

	_getCidAttachments(html) {
		let result = [];
		let cidRegex = /="cid:(.*?)"/g;
		let match = cidRegex.exec(html);
		while (match) {
			let cid = match[1];
			let attachment = {
				path: `cid:${cid}`,
				cid: cid
			};
			result.push(attachment);
			match = cidRegex.exec(html)
		}
		return result;
	}
}

module.exports = SenderService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['smtp-service', 'imap-service'];
