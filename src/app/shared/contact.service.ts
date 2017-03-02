import { Injectable } from '@angular/core';

@Injectable()
export class ContactService {
	public errors;

	private contacts: any;
	private myself: any;

	constructor() {
		this.errors = {
			contactArgumentMissing: () => 'Contact argument is missing.'
		};

		this.contacts = {};

		if (typeof electron !== 'undefined') {
			this.registerContactsMeChannel();
		}
	}

	public register(contact: any) {
		if (!contact) {
			throw new Error(this.errors.contactArgumentMissing());
		}

		if (!contact.name && this.contacts[contact.address]) {
			return;
		}

		this.contacts[contact.address] = contact;
	}

	public getAll(): any[] {
		return Object.keys(this.contacts).map(c => this.contacts[c]);
	}

	public getByAddress(address: string): any {
		return this.contacts[address];
	}

	public getMyself(): any {
		return this.myself;
	}

	private registerContactsMeChannel() {
		electron.ipcRenderer.on('contacts:me', (event, myself) => {
			this.myself = myself;
		});
		electron.ipcRenderer.send('contacts:me');
	}
}
