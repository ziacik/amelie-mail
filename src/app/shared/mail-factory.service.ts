import { Injectable } from '@angular/core';
import { Mail } from './mail';

@Injectable()
export class MailFactoryService {

	constructor() {
	}

	public createFromWriter(mailData: any): Mail {
		return null;
	}
}
