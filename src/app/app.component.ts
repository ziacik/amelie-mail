import { Component, OnInit, NgZone } from '@angular/core';
import { AppStateService } from './shared/app-state.service';

declare var electron: any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	mails: any[];

	constructor(private zone: NgZone, private appStateService: AppStateService) {
	}

	ngOnInit() {
		if (typeof electron !== 'undefined') {
			electron.ipcRenderer.send('listen');
			electron.ipcRenderer.on('fetch', (event, mails) => {
				console.log(mails);
				this.zone.run(() => this.mails = mails);
			});
		}
	}
}
