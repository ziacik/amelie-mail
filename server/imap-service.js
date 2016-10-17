'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');
require('rxjs/add/operator/mergeMap');

class ImapService {
	constructor(connectionFactory, accountSettingsService) {
		this.connectionFactory = connectionFactory;
		this.accountSettingsService = accountSettingsService;
	}

	listen() {
		return this.accountSettingsService.getAll().flatMap(accountSettings => {
			this.connection = this.connectionFactory(accountSettings);
			this.connection.once('ready', () => {});
			return rx.Observable.of(1);
		});
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['imap', 'account-settings-service'];
