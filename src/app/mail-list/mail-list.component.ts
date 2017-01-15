import { Component, Input } from '@angular/core';
import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-list',
	templateUrl: './mail-list.component.html',
	styleUrls: ['./mail-list.component.css']
})
export class MailListComponent {
	@Input()
	public mails: any[];

	constructor(private appStateService: AppStateService) {
	}

	private setActive(mail) {
		this.appStateService.setActiveMail(mail);
	}

	load(mail) {
		// if (electron) {
		// 	electron.ipcRenderer.send('get', mail.uid);
		// 	electron.ipcRenderer.on('got', (event, loadedMail) => {
		// 		this.zone.run(() => this.selectedMail.emit(loadedMail));
		// 	});
		// }
	}
}
