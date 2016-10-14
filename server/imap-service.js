'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/operator/mergeMap');

class ImapService {
	constructor(imapLibrary, accountSettingsService) {
		this.imapLibrary = imapLibrary;
		this.accountSettingsService = accountSettingsService;
	}

	listen() {
		return this.accountSettingsService.getAll().flatMap(accountSettings => {
			this.connection = new this.imapLibrary(accountSettings);
			return rx.Observable.of(1);
		});
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['imap', 'account-settings-service'];
