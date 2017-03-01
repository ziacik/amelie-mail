import { Component, AfterViewInit } from '@angular/core';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
	private writer: any;

	constructor(private appStateService: AppStateService, private mailService: MailService) {
	}

	ngAfterViewInit() {
		this.writer = jQuery('#writer');
		this.writer.modal('setting', {
			duration: 0,
			autofocus: false,
			closable: false,
			onVisible: () => {
				tinymce.execCommand('mceAddControl', false)
				setTimeout(() => tinymce.activeEditor.focus(), 1);
			},
			onHidden: () => tinymce.execCommand('mceRemoveControl', false)
		});
	}

	private compose() {
		this.writer.modal('show');
	}
}
