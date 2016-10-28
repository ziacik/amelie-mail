import { Component, OnInit, NgZone } from '@angular/core';

declare var electron: any;

@Component({
	selector: 'app-mail-list',
	templateUrl: './mail-list.component.html',
	styleUrls: ['./mail-list.component.css']
})
export class MailListComponent implements OnInit {
	private mails: any[];

	constructor(private zone: NgZone) { }

	ngOnInit() {
		electron.ipcRenderer.send('listen');
		electron.ipcRenderer.on('fetch', (event, mails) => {
			console.log(mails);
			this.zone.run(() => this.mails = mails);
		});
	}
}
