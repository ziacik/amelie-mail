import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { MD_DIALOG_DATA } from '@angular/material';

import { Mail } from '../shared/mail';
import { Recipient } from '../shared/recipient';
import { MailService } from '../shared/mail.service';
import { MailFactoryService } from '../shared/mail-factory.service';
import { ContactService } from '../shared/contact.service';
import { QuoteService } from '../shared/quote.service';

@Component({
	selector: 'app-mail-writer',
	templateUrl: './mail-writer.component.html',
	styleUrls: ['./mail-writer.component.css']
})
export class MailWriterComponent implements OnInit {
	form: FormGroup;

	constructor(@Inject(MD_DIALOG_DATA) private replyMail: Mail, private builder: FormBuilder, private mailService: MailService, private contactService: ContactService, private quoteService: QuoteService, private datePipe: DatePipe, private mailFactoryService: MailFactoryService) {
	}

	ngOnInit() {
		this.form = this.builder.group({
			recipients: [this.getInitialRecipients(), Validators.required],
			subject: this.getAdjustedSubject(),
			content: [this.getQuotedContent(), Validators.required]
		});
	}

	private getInitialRecipients(): Recipient[] {
		if (!this.replyMail.from) {
			return [];
		}

		let myAddress = this.contactService.getMyself().address;
		let isMyMail = this.replyMail.from.address === myAddress;

		if (isMyMail) {
			return this.replyMail.recipients.filter(r => r.address !== myAddress);
		}

		let recipients = [ new Recipient(this.replyMail.from, 'to') ];
		recipients = recipients.concat(this.replyMail.recipients.filter(r => r.address !== myAddress).map(r => new Recipient(r.contact, 'cc')));
		return recipients;
	}

	private getAdjustedSubject(): string {
		if (!this.replyMail.from) {
			return null;
		}

		let subject = this.replyMail.subject;

		if (!subject) {
			subject = 'Re:';
		} else if (!/[Rr][Ee]:/.test(subject)) {
			subject = 'Re: ' + subject;
		}

		return subject;
	}

	private getQuotedContent(): string {
		if (!this.replyMail.body) {
			return null;
		}

		let from = this.replyMail.from;
		let quotedMailDate = this.datePipe.transform(this.replyMail.date, 'medium');
		let quote = this.quoteService.quote(this.replyMail);
		let replyText = `<p></p><p>On ${quotedMailDate}, ${from.name || from.address} wrote:</p>${quote}`;

		return replyText;
	}

	private send() {
		let mailFormValue = this.form.value;
		this.removeStylePrefixesFrom(mailFormValue);
		let mail = this.mailFactoryService.createFromWriter(mailFormValue);
		this.mailService.send(mail);
	}

	private removeStylePrefixesFrom(mail) {
		if (!mail.content) {
			return;
		}

		mail.content = mail.content.replace(/#mail-editor /g, '');
	}
}
