import { Component, OnInit, Input } from '@angular/core';
import { MailService } from '../shared/mail.service';
import { MdDialog } from '@angular/material';
import { MailWriterComponent } from '../mail-writer/mail-writer.component';
import { Mail } from '../shared/mail';

@Component({
	selector: 'app-mail-header',
	templateUrl: './mail-header.component.html',
	styleUrls: ['./mail-header.component.css']
})
export class MailHeaderComponent implements OnInit {
	@Input() mail: Mail;

	constructor(private dialog: MdDialog, private mailService: MailService) {
	}

	ngOnInit() {
	}

	public reply(mail) {
		this.dialog.open(MailWriterComponent, {
			width: '900px',
			data: mail
		});
	}


	private read() {
		this.mailService.markSeen(this.mail);
		this.mail.markSeen();
	}

	private unread() {
		this.mailService.unmarkSeen(this.mail);
		this.mail.markUnseen();
	}
}
