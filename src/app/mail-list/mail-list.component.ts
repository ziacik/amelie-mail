import { Component, Input } from '@angular/core';
import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-list',
	templateUrl: './mail-list.component.html',
	styleUrls: ['./mail-list.component.css']
})
export class MailListComponent {
	@Input()
	public mails: any[];

	constructor(private appStateService: AppStateService) {
	}

	private setActive(mail) {
		this.appStateService.setActiveMail(mail);
	}
}
