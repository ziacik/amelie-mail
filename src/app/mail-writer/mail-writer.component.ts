import { Component, OnInit, AfterViewInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { MD_DIALOG_DATA } from '@angular/material';

import { MailService } from '../shared/mail.service';
import { ContactService } from '../shared/contact.service';
import { QuoteService } from '../shared/quote.service';

@Component({
	selector: 'app-mail-writer',
	templateUrl: './mail-writer.component.html',
	styleUrls: ['./mail-writer.component.css']
})
export class MailWriterComponent implements OnInit, AfterViewInit {
	form: FormGroup;

	constructor(@Inject(MD_DIALOG_DATA) private replyMail: any, private builder: FormBuilder, private mailService: MailService, private contactService: ContactService, private quoteService: QuoteService, private datePipe: DatePipe) {
	}

	ngOnInit() {
		this.form = this.builder.group({
			recipients: [[], Validators.required],
			subject: '',
			content: ['', Validators.required]
		});
	}

	ngAfterViewInit() {
		if (this.replyMail) {
			// TODO See https://github.com/angular/angular/issues/6005 for explanation
			Promise.resolve().then(() => this.openReply(this.replyMail));
		}
	}

	public open() {
		this.form.controls['recipients'].setValue([]);
		this.form.controls['subject'].setValue('');
		this.form.controls['content'].setValue('');
	}

	public openReply(replyMail: any) {
		let from = replyMail.from || [];
		let to = replyMail.to || [];
		let cc = replyMail.cc || [];
		let oneFrom = from[0] || {};

		let myAddress = this.contactService.getMyself().address;
		let iamInFrom = from.some(it => it.address === myAddress);

		let toContacts = iamInFrom ? from.concat(to) : from;
		let ccContacts = iamInFrom ? cc : to.concat(cc);

		let toAddresses = toContacts.filter(it => it.address !== myAddress).map(it => it.address);
		let ccAddresses = ccContacts.filter(it => it.address !== myAddress).map(it => it.address);

		let subject = replyMail.subject;

		if (!subject) {
			subject = 'Re:';
		} else if (!/[Rr][Ee]:/.test(subject)) {
			subject = 'Re: ' + subject;
		}

		let quotedMailDate = this.datePipe.transform(replyMail.date, 'medium');
		let quote = this.quoteService.quote(replyMail);
		let replyText = `<p></p><p>On ${quotedMailDate}, ${oneFrom.name || oneFrom.address} wrote:</p>${quote}`;

		this.form.controls['recipients'].setValue(toAddresses.concat(ccAddresses));
		this.form.controls['subject'].setValue(subject);
		this.form.controls['content'].setValue(replyText);
	}

	private send() {
		let mail = this.form.value;
		if (mail.to) {
			mail.to = this.toContacts(mail.to);
		}
		if (mail.cc) {
			mail.cc = this.toContacts(mail.cc);
		}
		if (mail.bcc) {
			mail.bcc = this.toContacts(mail.bcc);
		}

		this.removeStylePrefixesFrom(mail);
		this.mailService.send(mail);
	}

	private removeStylePrefixesFrom(mail) {
		if (!mail.content) {
			return;
		}

		mail.content = mail.content.replace(/#mail-editor /g, '');
	}

	private toContacts(addresses) {
		if (!addresses) {
			return addresses;
		}

		return addresses.map(address => (this.contactService.getByAddress(address) || address));
	}
}
