import { Component } from '@angular/core';

import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-view',
	templateUrl: './mail-view.component.html',
	styleUrls: ['./mail-view.component.css']
})
export class MailViewComponent {
	constructor(private appStateService: AppStateService) {
	}
}
