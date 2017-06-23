import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-attachment-item',
	templateUrl: './attachment-item.component.html',
	styleUrls: ['./attachment-item.component.css']
})
export class AttachmentItemComponent {
	@Input() attachment: any = {};

	constructor(private domSanitizer: DomSanitizer) {
	}

	getAttachmentUrl(): SafeUrl {
		return this.domSanitizer.bypassSecurityTrustUrl(`excid:${this.attachment.excid}`);
	}
}
