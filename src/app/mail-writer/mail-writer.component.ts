import { Component, AfterViewInit } from '@angular/core';

@Component({
	selector: 'app-mail-writer',
	templateUrl: './mail-writer.component.html',
	styleUrls: ['./mail-writer.component.css']
})
export class MailWriterComponent implements AfterViewInit {

	constructor() {
	}

	ngAfterViewInit() {
		jQuery('#to').dropdown({
			allowAdditions: true
		});
	}
}
