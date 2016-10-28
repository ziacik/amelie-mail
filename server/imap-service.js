'use strict';

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
	constructor(imap, accountSettingsService) {
		this.imap = imap;
		this.accountSettingsService = accountSettingsService;
	}

	listen() {
		return this.accountSettingsService.getAll().flatMap(accountSettings => {
			this.imap = new this.imap(accountSettings.host, accountSettings.port, accountSettings.options);
			return rx.Observable.fromPromise(this.imap.connect());
		// }).flatMap(() => {
		// 	return rx.Observable.fromPromise(this.imap.selectMailbox('INBOX'));
		}).flatMap(() => {
			return rx.Observable.fromPromise(this.imap.listMessages('INBOX', '1:*', ['uid', 'flags', 'BODY.PEEK[HEADER.FIELDS (SUBJECT)]']));
		});

			// return rx.Observable.merge(
			// 	rx.Observable.fromEvent(this.imap, 'error').flatMap(rx.Observable.throw),
			// 	rx.Observable.fromEvent(this.imap, 'ready')
			// );
		// });
		// }).flatMap(() => {
		// 	return rx.Observable.bindNodeCallback(this.imap.openBox.bind(this.imap))('INBOX');
		// });
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['emailjs-imap-client', 'account-settings-service'];
