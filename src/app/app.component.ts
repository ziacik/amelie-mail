import { Component, AfterViewInit } from '@angular/core';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';
import { MdDialog } from '@angular/material';
import { MailWriterComponent } from './mail-writer/mail-writer.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
	private writer: any;

	// TODO instead of making mailService public, expose mail via method
	constructor(private dialog: MdDialog, private appStateService: AppStateService, public mailService: MailService) {
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

	public compose() {
		this.dialog.open(MailWriterComponent, {
			width: '900px'
		});
	}
}
