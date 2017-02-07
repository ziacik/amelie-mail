import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MailService } from '../shared/mail.service';

@Component({
	selector: 'app-mail-writer',
	templateUrl: './mail-writer.component.html',
	styleUrls: ['./mail-writer.component.css']
})
export class MailWriterComponent implements OnInit, AfterViewInit {
	@Input() replyMail: any;

	form: FormGroup;

	constructor(private builder: FormBuilder, private mailService: MailService) {
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

		let toAddresses = from.concat(to).map(it => it.address);
		let ccAddresses = cc.map(it => it.address);
		let subject = replyMail.subject;

		if (!subject) {
			subject = 'Re:';
		} else if (!/[Rr][Ee]:/.test(subject)) {
			subject = 'Re: ' + subject;
		}

		let body = replyMail.bodyType === 'text/plain' ? (replyMail.body || '').replace(/\n/g, '<br />') : replyMail.body;

		let replyText = `<p></p>
			<p>On ${replyMail.date}, ${oneFrom.name || oneFrom.address} wrote:</p>
			<blockquote>
				${body}
			</blockquote>`

		this.form.controls['to'].setValue(toAddresses);
		this.form.controls['cc'].setValue(ccAddresses);
		this.form.controls['subject'].setValue(subject);
		this.form.controls['content'].setValue(replyText);
	}

	private send() {
		this.mailService.send(this.form.value);
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
