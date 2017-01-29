'use strict';

require('./rxjs-operators');

const Mail = require('./mail');
const rx = require('rxjs/Observable');

class SmtpService {
	constructor(accountSettingsService, Client) {
		this.errors = {
			mailArgumentMissing: 'Mail argument missing',
			errorSendingMail: 'Unable to send a mail'
		};
		this.Client = Client;
		this.accountSettingsService = accountSettingsService;
	}

	send(mail) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}

		return this.accountSettingsService.getAll()
			.flatMap(accountSettings => {
				this.accountSettings = accountSettings;
				this.client = new this.Client(accountSettings.host, accountSettings.port, accountSettings.options);
				return this._watchForErrors().zip(
					this._waitForIdle().flatMap(() => {
						this.client.useEnvelope({
							from: this.accountSettings.mailAddress,
							to: (mail.to || []).concat(mail.cc || []).concat(mail.bcc || [])
						});
						return this._waitForReady();
					})
					.flatMap(() => {
						this.client.send(mail.content);
						this.client.end();
						return this._waitForDone();
					}));
			});
	}

	_watchForErrors() {
		return rx.Observable.fromEventPattern(
			handler => this.client.onerror = handler,
			() => this.client.onerror = null
		).first().flatMap(err => rx.Observable.throw(err));
	}

	_waitForIdle() {
		return rx.Observable.fromEventPattern(
			handler => this.client.onidle = handler,
			() => this.client.onidle = null
		).first();
	}

	_waitForReady() {
		return rx.Observable.fromEventPattern(
			handler => this.client.onready = handler,
			() => this.client.onready = null
		).first();
	}

	_waitForDone() {
		return rx.Observable.fromEventPattern(
			handler => this.client.ondone = handler,
			() => this.client.ondone = null
		).first().flatMap(result => {
			if (result) {
				return rx.Observable.empty();
			} else {
				return rx.Observable.throw(new Error(this.errors.errorSendingMail));
			}
		})
	}
}

module.exports = SmtpService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'emailjs-smtp-client'];
