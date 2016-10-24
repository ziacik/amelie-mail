'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/observable/fromEvent');
require('rxjs/add/observable/merge');
require('rxjs/add/observable/throw');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/observable/bindNodeCallback');

class ImapService {
	constructor(imapConstructor, accountSettingsService) {
		this.imapConstructor = imapConstructor;
		this.accountSettingsService = accountSettingsService;
	}

	listen() {
		return this.accountSettingsService.getAll().flatMap(accountSettings => {
			accountSettings.debug = console.log;
			this.imap = new this.imapConstructor(accountSettings);
			this.imap.connect();

			return rx.Observable.merge(
				rx.Observable.fromEvent(this.imap, 'error').flatMap(rx.Observable.throw),
				rx.Observable.fromEvent(this.imap, 'ready')
			);
		}).flatMap(() => {
			return rx.Observable.bindNodeCallback(this.imap.openBox.bind(this.imap))('INBOX');
		});
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['imap', 'account-settings-service'];
