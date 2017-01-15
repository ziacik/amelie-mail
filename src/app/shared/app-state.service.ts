import { Injectable } from '@angular/core';
import { Mail } from './mail';

@Injectable()
export class AppStateService {
	private activeMail: Mail;

	constructor() {
	}

	setActiveMail(mail: Mail) {
		this.activeMail = mail;
	}

	getActiveMail(): Mail {
		return this.activeMail;
	}
}
