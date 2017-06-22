import { Component, Input } from '@angular/core';
import { AppStateService } from '../shared/app-state.service';
import { MailService } from '../shared/mail.service';

@Component({
	selector: 'app-mail-list',
	templateUrl: './mail-list.component.html',
	styleUrls: ['./mail-list.component.css']
})
export class MailListComponent {
	@Input()
	public mails: any[];
	private activeMailIndex: number;

	constructor(private appStateService: AppStateService, private mailService: MailService) {
		this.activeMailIndex = -1;
	}

	public mailsBefore() {
		if (this.activeMailIndex < 0) {
			return this.mails;
		}

		return this.mails.slice(0, this.activeMailIndex);
	}

	public mailsAfter() {
		if (this.activeMailIndex < 0) {
			return [];
		}

		return this.mails.slice(this.activeMailIndex + 1, this.mails.length);
	}

	public setActive(mail) {
		let am = this.mails.indexOf(mail);

		if (this.activeMailIndex === am) {
			this.appStateService.setActiveMail(null);
		} else {
			this.activeMailIndex = am;
			this.appStateService.setActiveMail(mail);
		}
	}

	public getFromDisplayNames(mail) {
		if (!mail.from || !mail.from.length) {
			return 'Unknown';
		} else {
			return mail.from.map(from => from.name || from.address || 'Unknown').join(', ');
		}
	}

	public read(mail) {
		this.mailService.markSeen(mail);
		mail.markSeen();
	}

	public unread(mail) {
		this.mailService.unmarkSeen(mail);
		mail.unmarkSeen();
	}
}
