import { Injectable } from '@angular/core';

@Injectable()
export class ContactService {
	public errors;

	private contacts: any;

	constructor() {
		this.errors = {
			contactArgumentMissing: () => 'Contact argument is missing.'
		};

		this.contacts = {}
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
}
