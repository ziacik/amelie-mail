import { Injectable, NgZone } from '@angular/core';

declare var electron: any;

@Injectable()
export class MailService {
	private mails: any[];

	constructor(private zone: NgZone) {
		this.mails = [];

		if (typeof electron !== 'undefined') {
			this.registerFetch();
			this.startListening();
		}
	}

	public getMails(): any[] {
		return this.mails;
	}

	private startListening() {
		electron.ipcRenderer.send('mail:listen');
	}

	private registerFetch() {
		electron.ipcRenderer.on('mail:fetch', (event, mails) => {
			this.zone.run(() => {
				this.mails = mails.slice().reverse().concat(this.mails);
			});
		});
	}
}
