'use strict';

require('./rxjs-operators');

const Rx = require('rxjs');

class SmtpService {
	constructor(accountSettingsService, client) {
		this.errors = {
			mailArgumentMissing: 'Mail argument missing',
			errorSendingMail: 'Unable to send a mail'
		};
		this.client = client;
		this.accountSettingsService = accountSettingsService;
	}

	send(mail) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}

		return this._createTransport().flatMap(transport => this._sendMail(transport, mail))
	}

	_createTransport() {
		return this.accountSettingsService.getAll().map(accountSettings => {
			return this.client.createTransport(accountSettings.smtp, {
				from: `"${accountSettings.name}" <${accountSettings.mailAddress}>`
			});
		});
	}

	_sendMail(transport, mail) {
		let sendMail = Rx.Observable.bindNodeCallback(transport.sendMail.bind(transport));
		return sendMail({
			to: mail.to,
			cc: mail.cc,
			bcc: mail.bcc,
			subject: mail.subject,
			html: mail.content
		});
	}
}

module.exports = SmtpService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'nodemailer'];
