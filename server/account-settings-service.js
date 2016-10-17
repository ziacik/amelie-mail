'use strict';

const os = require('os');
const path = require('path');

const rx = require('rxjs/Observable');
require('rxjs/add/observable/bindNodeCallback');
require('rxjs/add/operator/map');

class AccountSettingsService {
	constructor(fs) {
		this.fs = fs;
	}

	getAll() {
		return rx.Observable.bindNodeCallback(this.fs.readFile)(path.join(os.homedir(), '.amelie-mail.accounts.json'), 'utf8').map(data => JSON.parse(data));
	}
}

module.exports = AccountSettingsService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['fs'];
