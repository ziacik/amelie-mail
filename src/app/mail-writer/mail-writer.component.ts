import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { MailService } from '../shared/mail.service';
import { ContactService } from '../shared/contact.service';

@Component({
	selector: 'app-mail-writer',
	templateUrl: './mail-writer.component.html',
	styleUrls: ['./mail-writer.component.css']
})
export class MailWriterComponent implements OnInit, AfterViewInit {
	@Input() replyMail: any;

	form: FormGroup;

	constructor(private builder: FormBuilder, private mailService: MailService, private contactService: ContactService, private datePipe: DatePipe) {
	}

	ngOnInit() {
		this.form = this.builder.group({
			to: [[]],
			cc: [[]],
			subject: '',
			content: ['', Validators.required]
		}, { validator: this.recipientRequired });
	}

	ngAfterViewInit() {
		jQuery('#to').dropdown({
			allowAdditions: true
		});
		jQuery('#cc').dropdown({
			allowAdditions: true
		});
	}

	public open() {
		this.form.controls['to'].setValue([]);
		this.form.controls['cc'].setValue([]);
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
		let body = replyMail.bodyType === 'text/plain' ? (replyMail.body || '').replace(/\n/g, '<br />') : replyMail.body;
		let replyText = `<p></p><p>On ${quotedMailDate}, ${oneFrom.name || oneFrom.address} wrote:</p><blockquote>${body}</blockquote>`

		this.form.controls['to'].setValue(toAddresses);
		this.form.controls['cc'].setValue(ccAddresses);
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
		this.mailService.send(mail);
	}

	private toContacts(addresses) {
		if (!addresses) {
			return addresses;
		}

		return addresses.map(address => (this.contactService.getByAddress(address) || address));
	}

	private recipientRequired(group: FormGroup) {
		let controls = ['to', 'cc'];
		let atLeastOneOk = controls.some(it => {
			let validator = Validators.required(group.controls[it]);
			return !validator || !validator['required'];
		});

		let result = atLeastOneOk ? null : { recipientRequired: true };
		controls.forEach(control => group.controls[control].setErrors(result));
	}
}
