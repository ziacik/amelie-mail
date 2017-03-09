'use strict';

require('./rxjs-operators');

const rx = require('rxjs/Observable');
const Mail = require('./mail');
const BodyStructure = require('./body-structure');

class ImapService {
	constructor(accountSettingsService, Client, codec) {
		this.Client = Client;
		this.codec = codec;
		this.accountSettingsService = accountSettingsService;

		this.errors = {
			uidArgumentMissing: 'Missing uid argument.',
			flagArgumentMissing: 'Missing flag argument.',
			extendedCidArgumentMissing: 'Missing extendedCid argument.',
			extendedCidUnparsable: 'Unable to parse extended cid.',
			unsupportedEncoding: which => `Unsupported encoding "${which}".`
		};

		this.byUid = {
			byUid: true
		};
	}

	listen() {
		return this.accountSettingsService.getAll()
			.flatMap(accountSettings => {
				this.client = new this.Client(accountSettings.imap.host, accountSettings.imap.port, accountSettings.imap.options);
				this.client.logLevel = this.client.LOG_LEVEL_INFO;
				return this._connectAndStart();
			})
			.concat(this._listen())
			.map(messages => {
				return messages.map(message => {
					let attachments = this._getAttachmentRefs(message);
					let mail = new Mail(message.uid)
						.withMessageId(message.envelope['message-id'])
						.withSubject(message.envelope.subject)
						.withFrom(message.envelope.from || [])
						.withTo(message.envelope.to || [])
						.withCc(message.envelope.cc || [])
						.withDate(new Date(message.envelope.date))
						.withAttachments(attachments)
						.withIsSeen(!!message.flags && message.flags.indexOf('\\Seen') >= 0);

					if (message.body && message.bodyType) {
						mail.withBody(message.body, message.bodyType);
					}

					return mail;
				})
			});
	}

	addFlag(uid, flag) {
		if (!uid) {
			throw new Error(this.errors.uidArgumentMissing);
		}

		if (!flag) {
			throw new Error(this.errors.flagArgumentMissing);
		}

		return rx.Observable.fromPromise(this.client.setFlags('INBOX', '' + uid, {
			add: [flag]
		}, this.byUid));
	}

	removeFlag(uid, flag) {
		if (!uid) {
			throw new Error(this.errors.uidArgumentMissing);
		}

		if (!flag) {
			throw new Error(this.errors.flagArgumentMissing);
		}

		return rx.Observable.fromPromise(this.client.setFlags('INBOX', '' + uid, {
			remove: [flag]
		}, this.byUid));
	}

	getAttachment(extendedCid) {
		if (!extendedCid) {
			throw new Error(this.errors.extendedCidArgumentMissing);
		}

		let split = extendedCid.split(';');

		if (split.length != 4) {
			throw new Error(this.errors.extendedCidUnparsable);
		}

		let uid = split[1];
		let partId = split[2];
		let encoding = split[3];

		this._checkBinaryDecodable(encoding);

		let messagesPromise = this.client.listMessages('INBOX', uid, ['uid', `body.peek[${partId}]`], this.byUid).then(messages => {
			let message = messages[0];
			let bodyEncoded = message[`body[${partId}]`];
			let bodyDecoded = this._binaryDecode(bodyEncoded, encoding);
			return bodyDecoded;
		});

		return rx.Observable.fromPromise(messagesPromise);
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
			return this.client.listMessages('INBOX', partInfo.uidList, ['uid', `body.peek[${partInfo.part}]`], this.byUid).then(bodyMessages => {
				bodyMessages.forEach(bodyMessage => {
					let message = messages.filter(it => it.uid === bodyMessage.uid)[0];

					if (message) {
						let part = this._getPart(message.bodystructure, partType);
						let bodyEncoded = bodyMessage[`body[${partInfo.part}]`];
						let bodyDecoded = this._decode(bodyEncoded, part.encoding, (part.parameters || {}).charset);
						if (partType === 'text/html') {
							bodyDecoded = this._convertCids(message, bodyDecoded);
						}
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

	_convertCids(message, html) {
		return html.replace(/="cid:(.*?)"/g, (match, cid) => {
			let part = this._findPartByCid(message.bodystructure, cid);
			return part ? `="excid:${cid};${message.uid};${part.part};${part.encoding}"` : '=""';
		});
	}

	_decode(bodyEncoded, encoding, charset) {
		if (encoding === 'base64') {
			return this.codec.base64Decode(bodyEncoded, charset);
		} else {
			return this.codec.quotedPrintableDecode(bodyEncoded, charset);
		}
	}

	_checkBinaryDecodable(encoding) {
		if (encoding !== 'base64') {
			throw new Error(this.errors.unsupportedEncoding(encoding));
		}
	}

	_binaryDecode(bodyEncoded, encoding) {
		if (encoding === 'base64') {
			return this.codec.base64.decode(bodyEncoded);
		} else {
			return this.codec.base64.decode(bodyEncoded);
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
		return new BodyStructure(structure).findNonAttachmentByType(partType);
	}

	_findPartByCid(structure, cid) {
		return new BodyStructure(structure).findById(cid);
	}

	_getAttachmentRefs(message) {
		let parts = this._getAttachmentParts(message.bodystructure);
		return parts.map(part => ({
			name: part.dispositionParameters && part.dispositionParameters.filename || '(unknown)',
			excid: `${part.id};${message.uid};${part.part};${part.encoding}`
		}));
	}

	_getAttachmentParts(structure) {
		return new BodyStructure(structure).findAttachments();
	}
}

module.exports = ImapService;
module.exports['@singleton'] = true;
module.exports['@require'] = ['account-settings-service', 'emailjs-imap-client', 'emailjs-mime-codec'];
