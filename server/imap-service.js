'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');

class ImapService {
	listen() {
		this.connect();
		return rx.Observable.of(1);
	}

	connect() {
	}
}

module.exports = ImapService;
