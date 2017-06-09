import { Contact } from './contact';

export class Recipient {
	private _contact: Contact;
	private _type: string;

	constructor(contact: Contact, type: string) {
		this._contact = contact;
		this._type = type;
	}

	get contact(): Contact {
		return this._contact;
	}

	get name(): string {
		return this._contact.name;
	}

	get address(): string {
		return this._contact.address;
	}

	get type(): string {
		return this._type;
	}
}
