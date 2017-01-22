/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppComponent } from './app.component';
import { AppStateService } from './shared/app-state.service';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailViewComponent } from './mail-view/mail-view.component';

describe('App: AmelieMail', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AppComponent,
				MailListComponent,
				MailViewComponent
			],
			providers: [
				AppStateService
			]
		});

		TestBed.overrideComponent(MailListComponent, {
			set: {
				template: '<div>Overridden template here</div>'

			}
		});

		TestBed.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
});
