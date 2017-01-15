'use strict';

const Mail = require('./mail');
const codec = require('emailjs-mime-codec');

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
						.withPreview(message.preview)
						.withIsSeen(message.flags && message.flags.indexOf('\\Seen') >= 0)
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
				let last1oo = inboxInfo.exists - 8;
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
						let part = this.getPlainTextPart(message.bodystructure);
						let bodyEncoded = bodyMessage[`body[${partInfo.part}]`];
						let bodyDecoded = this.decode(bodyEncoded, part.encoding, (part.parameters || {}).charset);
						message.body = bodyDecoded;
						message.preview = message.body.substr(0, 200);
					}
				});
			});
		});
		return Promise.all(promises).then(() => messages);
	}

	decode(bodyEncoded, encoding, charset) {
		if (encoding === 'quoted-printable') {
			return codec.quotedPrintableDecode(bodyEncoded, charset);
		} else if (encoding === 'base64') {
			return codec.base64Decode(bodyEncoded, charset);
		} else {
			return bodyEncoded;
		}
	}

	/* private */
	getPlainTextPartCodeMap(messages) {
		let map = {};
		messages.forEach(message => {
			console.log(JSON.stringify(message, null, '   '));
			let part = this.getPlainTextPart(message.bodystructure);
			if (part !== undefined) {
				let partCode = part.part || '1';
				map[partCode] = map[partCode] || [];
				map[partCode].push(message.uid);
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
	getPlainTextPart(structure) {
		if (structure.type === 'text/plain') {
			return structure;
		}

		if (structure.childNodes) {
			for (let i = 0; i < structure.childNodes.length; i++) {
				let childPart = this.getPlainTextPart(structure.childNodes[i]);
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
