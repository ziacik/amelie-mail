import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-mail-item',
	templateUrl: './mail-item.component.html',
	styleUrls: ['./mail-item.component.css']
})
export class MailItemComponent implements OnInit {
	@Input()
	public mail: any;

	constructor() {
	}

	ngOnInit() {
	}

	private getFromDisplayNames() {
		if (!this.mail.from || !this.mail.from.length) {
			return 'Unknown';
		} else {
			return this.mail.from.map(from => from.name || from.address || 'Unknown').join(', ');
		}
	}
}
