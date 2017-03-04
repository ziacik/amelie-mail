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

		return this._getAccountSettings().flatMap(accountSettings => {
			return this._createTransport(accountSettings).flatMap(transport => this._sendMail(transport, accountSettings, mail))
		});
	}

	_getAccountSettings() {
		return this.accountSettingsService.getAll();
	}

	_createTransport(accountSettings) {
		return Rx.Observable.of(this.client.createTransport(accountSettings.smtp, {
			from: `"${accountSettings.name}" <${accountSettings.mailAddress}>`
		}));
	}

	_sendMail(transport, accountSettings, mail) {
		let sendMail = Rx.Observable.bindNodeCallback(transport.sendMail.bind(transport));
		let myself = {
			name: accountSettings.name,
			address: accountSettings.mailAddress
		};
		return sendMail({
			attachments: mail.attachments,
			to: mail.to,
			cc: mail.cc,
			bcc: [myself].concat(mail.bcc || []),
			subject: mail.subject,
			html: mail.content
		});
	}
}

module.exports = SmtpService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'nodemailer'];
