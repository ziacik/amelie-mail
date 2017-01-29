'use strict';

require('./rxjs-operators');

const rx = require('rxjs/Observable');
const Mail = require('./mail');

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
				this.client.logLevel = this.client.LOG_LEVEL_INFO;
				return this._connectAndStart();
			})
			.concat(this._listen())
			.map(messages => {
				return messages.map(message => {
					let mail = new Mail(message.uid)
						.withMessageId(message.envelope['message-id'])
						.withSubject(message.envelope.subject)
						.withFrom(message.envelope.from || [])
						.withTo(message.envelope.to || [])
						.withCc(message.envelope.cc || [])
						.withDate(new Date(message.envelope.date))
						.withIsSeen(!!message.flags && message.flags.indexOf('\\Seen') >= 0);

					if (message.body && message.bodyType) {
						mail.withBody(message.body, message.bodyType);
					}

					return mail;
				})
			});
	}

	setFlag(uid, flag) {
		return rx.Observable.fromPromise(this.client.setFlags('INBOX', '' + uid, {
			set: [flag]
		}, {
			byUid: true
		}));
	}

	removeFlag(uid, flag) {
		return rx.Observable.fromPromise(this.client.setFlags('INBOX', '' + uid, {
			remove: [flag]
		}, {
			byUid: true
		}));
	}

	_listen() {
		return rx.Observable.fromEventPattern(
			handler => {
				this.client.onupdate = handler;
			},
			() => {
				this.client.onpudate = null;
			},
			(path, type, value) => ({
				path: path,
				type: type,
				value: value
			})
		).flatMap(updateInfo => {
			if (updateInfo.type === 'exists') {
				let sequenceStr = (this.inboxInfo.exists + 1) + ':' + updateInfo.value;
				this.inboxInfo.exists = updateInfo.value;
				return this._load(sequenceStr);
			} else {
				return rx.Observable.empty();
			}
		});
	}

	_connectAndStart() {
		return rx.Observable.fromPromise(
			this.client.connect()
			.then(() => this.client.selectMailbox('INBOX'))
			.then(inboxInfo => {
				this.inboxInfo = inboxInfo;
				return inboxInfo;
			})
		).flatMap(inboxInfo => {
			if (inboxInfo.exists === 0) {
				return rx.Observable.empty();
			}

			let last1oo = inboxInfo.exists - 100;

			if (last1oo <= 0) {
				return this._load('*');
			} else {
				return this._load(last1oo + ':*');
			}
		});
	}

	_load(sequenceStr) {
		return rx.Observable.fromPromise(
			this.client.listMessages('INBOX', sequenceStr, ['uid', 'flags', 'envelope', 'bodystructure'])
			.then(messages => this._addBodies(messages, 'text/plain'))
			.then(messages => this._addBodies(messages, 'text/html'))
		).map(mess => {
			return mess;
		})
	}

	_addBodies(messages, partType) {
		let plainTextPartMap = this._getPartCodeMap(messages, partType);
		let promises = plainTextPartMap.map(partInfo => {
			return this.client.listMessages('INBOX', partInfo.uidList, ['uid', `body.peek[${partInfo.part}]`], {
				byUid: true
			}).then(bodyMessages => {
				bodyMessages.forEach(bodyMessage => {
					let message = messages.filter(it => it.uid === bodyMessage.uid)[0];

					if (message) {
						let part = this._getPart(message.bodystructure, partType);
						let bodyEncoded = bodyMessage[`body[${partInfo.part}]`];
						let bodyDecoded = this._decode(bodyEncoded, part.encoding, (part.parameters || {}).charset);
						message.body = bodyDecoded;
						message.bodyType = partType;
					}
				});
			});
		});
		return Promise.all(promises).then(() => {
			return messages;
		});
	}

	_decode(bodyEncoded, encoding, charset) {
		if (encoding === 'base64') {
			return this.codec.base64Decode(bodyEncoded, charset);
		} else {
			return this.codec.quotedPrintableDecode(bodyEncoded, charset);
		}
	}

	_getPartCodeMap(messages, partType) {
		let map = {};

		messages.forEach(message => {
			let part = this._getPart(message.bodystructure, partType);
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

	_getPart(structure, partType) {
		if (structure.type === partType) {
			return structure;
		}

		if (structure.childNodes) {
			for (let i = 0; i < structure.childNodes.length; i++) {
				let childPart = this._getPart(structure.childNodes[i], partType);
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
