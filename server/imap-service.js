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
		return this.accountSettingsService.getAll()
			.flatMap(accountSettings => {
				this.client = new this.Client(accountSettings.host, accountSettings.port, accountSettings.options);
				return rx.Observable.fromPromise(this.connectAndStart());
			})
			.map(messages => {
				return messages.map(message => {
					return new Mail()
						.withUid(message.uid)
						.withMessageId(message.envelope['message-id'])
						.withSubject(message.envelope.subject)
						.withFrom(message.envelope.from || [])
						.withTo(message.envelope.to || [])
						.withBody(message.body)
						.withPreview(message.preview);
				})
			});
	}

	get(uid) {
		return this.client.listMessages('INBOX', uid, ['BODY[]'], {
			byUid: true
		}).then(m => {
			return m;
		});
	}

	/* private */
	connectAndStart() {
		return this.client.connect()
			.then(() => this.client.selectMailbox('INBOX'))
			.then(inboxInfo => {
				let last1oo = inboxInfo.exists - 100;
				return this.client.listMessages('INBOX', last1oo + ':*', ['uid', 'flags', 'envelope', 'bodystructure']);
			})
			.then(messages => this.addPlainTexts(messages));
	}

	/* private */
	addPlainTexts(messages) {
		let plainTextPartMap = this.getPlainTextPartCodeMap(messages);
		let promises = plainTextPartMap.map(partInfo => {
			return this.client.listMessages('INBOX', partInfo.uidList, ['uid', `body.peek[${partInfo.part}]`], {
				byUid: true
			}).then(bodyMessages => {
				bodyMessages.forEach(bodyMessage => {
					let message = messages.filter(it => it.uid === bodyMessage.uid)[0];

					if (message) {
						message.body = bodyMessage[`body[${partInfo.part}]`];
						message.preview = message.body.substr(0, 200);
					}
				});
			});
		});
		return Promise.all(promises).then(() => messages);
	}

	/* private */
	getPlainTextPartCodeMap(messages) {
		let map = {};
		messages.forEach(message => {
			let part = this.getPlainTextPartCodeMapFrom(message.bodystructure);
			if (part !== undefined) {
				map[part] = map[part] || [];
				map[part].push(message.uid);
			}
		});
		return Object.keys(map).map(part => {
			return {
				part: part,
				uidList: map[part].join(',') // TODO compress the uids in a:b formats?
			};
		});
	}

	/* private */
	getPlainTextPartCodeMapFrom(structure) {
		if (structure.type === 'text/plain') {
			return structure.part || '1';
		}

		if (structure.childNodes) {
			for (let i = 0; i < structure.childNodes.length; i++) {
				let childPart = this.getPlainTextPartCodeMapFrom(structure.childNodes[i]);
				if (childPart !== undefined) {
					return childPart;
				}
			}
		}
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'emailjs-imap-client', 'emailjs-mime-codec'];
