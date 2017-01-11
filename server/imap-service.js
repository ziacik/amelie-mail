'use strict';

const Mail = require('./mail');

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/observable/fromPromise');
require('rxjs/add/observable/fromEvent');
require('rxjs/add/observable/merge');
require('rxjs/add/observable/throw');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/observable/bindNodeCallback');

class ImapService {
	constructor(accountSettingsService, Client, codec) {
		this.Client = Client;
		this.codec = codec;
		this.accountSettingsService = accountSettingsService;
	}

	listen() {
		return this.accountSettingsService.getAll().flatMap(accountSettings => {
			this.client = new this.Client(accountSettings.host, accountSettings.port, accountSettings.options);
			return rx.Observable.fromPromise(this.client.connect());
		}).flatMap(() => {
			return rx.Observable.fromPromise(this.client.listMessages('INBOX', '1:*', ['uid', 'flags', 'envelope', 'bodystructure']));
		}).map(messages => {
			return messages.map(message => {
				console.log(message);
				return new Mail()
					.withUid(message.uid)
					.withMessageId(message.envelope['message-id'])
					.withSubject(message.envelope.subject)
					.withFrom(message.envelope.from)
					.withTo(message.envelope.to);
			})
		});
	}

	get(uid) {
		return this.client.listMessages('INBOX', uid, ['BODY[]'], {
			byUid: true
		}).then(m => {
			console.log(m);
			return m;
		});
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'emailjs-imap-client', 'emailjs-mime-codec'];
