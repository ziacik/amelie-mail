import { Injectable, NgZone } from '@angular/core';

declare var electron: any;

@Injectable()
export class MailService {
	private mails: any[];
	private errors: any;

	constructor(private zone: NgZone) {
		this.mails = [];
		this.errors = {
			mailArgumentMissing: 'Mail argument missing.'
		};

		if (typeof electron !== 'undefined') {
			this.registerFetch();
			this.startListening();
		}
	}

	public getMails(): any[] {
		return this.mails;
	}

	public markSeen(mail: any) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:mark:seen', mail.uid);
	}

	public unmarkSeen(mail: any) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:unmark:seen', mail.uid);
	}

	public send(mail: any) {
		if (!mail) {
			throw new Error(this.errors.mailArgumentMissing);
		}
		electron.ipcRenderer.send('mail:send', mail);
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
