'use strict';

require('./rxjs-operators');

const rx = require('rxjs/Observable');
const libbase64 = require('libbase64');
const libqp = require('libqp');
const stringToStream = require('string-to-stream');
const streamToArray = require('stream-to-array');
const util = require('util');

class AttachmentService {
	constructor() {
		this.errors = {
			dataArgumentMissing: () => 'Data argument is missing.',
			encodingArgumentMissing: () => 'Encoding argument is missing.'
		};
	}

	decode(data, encoding) {
		if (!data) {
			throw new Error(this.errors.dataArgumentMissing());
		}

		if (!encoding) {
			throw new Error(this.errors.encodingArgumentMissing());
		}

		if (encoding === 'base64') {
			return this._decodeWith(data, new libbase64.Decoder());
		} else if (encoding === 'quoted-printable') {
			return this._decodeWith(data, new libqp.Decoder());
		} else {
			return Promise.resolve(new Buffer(data));
		}
	}

	_decodeWith(data, decoder) {
		let input = stringToStream(data);
		let output = input.pipe(decoder);
		return streamToArray(output).then(parts => {
			const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part));
			return Buffer.concat(buffers);
		});
	}
}

module.exports = AttachmentService;
module.exports['@singleton'] = true;
module.exports['@require'] = [];
