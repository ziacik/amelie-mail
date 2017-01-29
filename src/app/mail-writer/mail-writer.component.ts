import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-mail-writer',
	templateUrl: './mail-writer.component.html',
	styleUrls: ['./mail-writer.component.css']
})
export class MailWriterComponent implements AfterViewInit {
	form: FormGroup;

	constructor(private builder: FormBuilder) {
		this.form = builder.group({
			to: '',
			cc: '',
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
