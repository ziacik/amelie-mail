import { Component } from '@angular/core';

import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-view',
	templateUrl: './mail-view.component.html',
	styleUrls: ['./mail-view.component.css']
})
export class MailViewComponent {
	constructor(private appStateService: AppStateService) {
	}

	private getActiveMail(): any {
		return this.appStateService.getActiveMail();
	}

	private isText(): boolean {
		let activeMail = this.getActiveMail();

		if (!activeMail) {
			return false;
		}

		return activeMail.bodyType === 'text/plain';
	}

	private isHtml(): boolean {
		let activeMail = this.getActiveMail();

		if (!activeMail) {
			return false;
		}

		return activeMail.bodyType === 'text/html';
	}
}
