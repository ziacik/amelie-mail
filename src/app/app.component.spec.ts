/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppComponent } from './app.component';
import { AppStateService } from './shared/app-state.service';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailHeaderComponent } from './mail-header/mail-header.component';
import { MailViewComponent } from './mail-view/mail-view.component';

describe('App: AmelieMail', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let appStateService: AppStateService;
	let activeMail: amy;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AppComponent,
				MailListComponent,
				MailHeaderComponent,
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
		activeMail = {
			some: 'thing'
		};
		appStateService = TestBed.get(AppStateService);
		spyOn(appStateService, 'getActiveMail').and.returnValue(activeMail);
		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('has a mail header component with active mail set', () => {
		let mailHeader = fixture.debugElement.query(By.directive(MailHeaderComponent));
		expect(!!mailHeader).toBeTruthy();
		expect(mailHeader.componentInstance.mail).toBe(activeMail);
	});

	it('has a mail view component with active mail set', () => {
		let mailView = fixture.debugElement.query(By.directive(MailViewComponent));
		expect(!!mailView).toBeTruthy();
		expect(mailView.componentInstance.mail).toBe(activeMail);
	});
});
