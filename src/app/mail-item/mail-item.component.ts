import { Component, Input } from '@angular/core';
import { Mail } from '../shared/mail';

@Component({
	selector: '[app-mail-item]',
	templateUrl: './mail-item.component.html',
	styleUrls: ['./mail-item.component.css']
})
export class MailItemComponent {
	@Input()
	public mail: Mail;

	constructor() {
	}
}
