import { Injectable } from '@angular/core';
import { Contact } from './contact';

@Injectable()
export class ContactService {
	public errors : any;

	private contacts: { [ key: string ]: Contact };
	private myself: Contact;

	constructor() {
		this.errors = {
			contactArgumentMissing: () => 'Contact argument is missing.'
		};

		this.contacts = {};

		if (typeof electron !== 'undefined') {
			this.registerContactsMeChannel();
		}
	}

	public register(contact: Contact) {
		if (!contact) {
			throw new Error(this.errors.contactArgumentMissing());
		}

		if (!contact.name && this.contacts[contact.address]) {
			return;
		}

		this.contacts[contact.address] = contact;
	}

	public getAll(): Contact[] {
		return Object.keys(this.contacts).map(c => this.contacts[c]);
	}

	public getByAddress(address: string): Contact {
		return this.contacts[address];
	}

	public getMyself(): Contact {
		return this.myself;
	}

	private registerContactsMeChannel() {
		electron.ipcRenderer.on('contacts:me', (event, data) => {
			this.myself = new Contact(data.name, data.address);
		});
		electron.ipcRenderer.send('contacts:me');
	}
}
