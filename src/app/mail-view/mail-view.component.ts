import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-view',
	templateUrl: './mail-view.component.html',
	styleUrls: ['./mail-view.component.css']
})
export class MailViewComponent {
	@Input() mail: any;

	constructor(private domSanitizer: DomSanitizer) {
	}

	private isText(): boolean {
		if (!this.mail) {
			return false;
		}

		return this.mail.bodyType === 'text/plain';
	}

	private isHtml(): boolean {
		if (!this.mail) {
			return false;
		}

		return this.mail.bodyType === 'text/html';
	}

	private getText(): string {
		if (!this.mail || !this.mail.body) {
			return '';
		}

		return this.mail.body;
	}

	private getHtml(): SafeHtml {
		if (!this.mail || !this.mail.body) {
			return '';
		}

		// FIXME Security Issue. Without this, <html> tags (and thus also stylings) are removed. What should we do?
		return this.domSanitizer.bypassSecurityTrustHtml(this.mail.body);
	}
}
