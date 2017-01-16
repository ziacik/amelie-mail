import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-view',
	templateUrl: './mail-view.component.html',
	styleUrls: ['./mail-view.component.css']
})
export class MailViewComponent {
	constructor(private domSanitizer: DomSanitizer, private appStateService: AppStateService) {
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

	private getHtml(): SafeHtml {
		let activeMail = this.getActiveMail();

		if (!activeMail || !activeMail.body) {
			return '';
		}

		// FIXME Security Issue. Without this, <html> tags (and thus also stylings) are removed. What should we do?
		return this.domSanitizer.bypassSecurityTrustHtml(activeMail.body);
	}
}
