'use strict';

require('./rxjs-operators');

const Mail = require('./mail');
const Rx = require('rxjs');

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

		return this._createClient().flatMap(client => {
			return Rx.Observable.merge(
				this._watchForErrors(client),
				this._connect(client),
				this._onIdleSendEnvelope(client, mail),
				this._onReadySendMail(client, mail)
			).takeUntil(this._onDoneFinish(client));
		});
	}

	_createClient() {
		return this.accountSettingsService.getAll().map(accountSettings => {
			let client = new this.Client(accountSettings.host, accountSettings.port, accountSettings.options);
			client.from = accountSettings.mailAddress;
			return client;
		});
	}

	_connect(client) {
		return Rx.Observable.defer(() => Rx.Observable.of(client.connect()));
	}

	_watchForErrors(client) {
		let errorObservable = Rx.Observable.fromEventPattern(
				handler => client.onerror = handler,
				() => client.onerror = null
			)
			.first();

		let closeObservable = Rx.Observable.fromEventPattern(
				handler => client.onclose = handler,
				() => client.onclose = null
			)
			.map(() => new Error('Unexpected close'))
			.first();

		return Rx.Observable.merge(errorObservable, closeObservable).flatMap(err => Rx.Observable.throw(err));
	}

	_onIdleSendEnvelope(client, mail) {
		return Rx.Observable.fromEventPattern(
			handler => client.onidle = handler,
			() => client.onidle = null
		).first().map(() => {
			client.useEnvelope({
				from: client.from,
				to: (mail.to || []).concat(mail.cc || []).concat(mail.bcc || [])
			});
		})
	}

	_onReadySendMail(client, mail) {
		return Rx.Observable.fromEventPattern(
			handler => client.onready = handler,
			() => client.onready = null
		).first().map(() => {
			client.send(mail.content);
			client.end();
		});
	}

	_onDoneFinish(client) {
		return Rx.Observable.fromEventPattern(
			handler => client.ondone = handler,
			() => client.ondone = null
		).first().flatMap(result => {
			if (result) {
				return Rx.Observable.of(null);
			} else {
				return Rx.Observable.throw(new Error(this.errors.errorSendingMail));
			}
		})
	}
}

module.exports = SmtpService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'emailjs-smtp-client'];
