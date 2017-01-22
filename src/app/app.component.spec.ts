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
		appStateService = TestBed.get(AppStateService);
		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	describe('with no active mail', () => {
		it('has no mail header component', () => {
			let mailHeader = fixture.debugElement.query(By.directive(MailHeaderComponent));
			expect(!!mailHeader).toBeFalsy();
		});

		it('has no mail view component', () => {
			let mailView = fixture.debugElement.query(By.directive(MailViewComponent));
			expect(!!mailView).toBeFalsy();
		});
	});

	describe('with active mail', () => {
		let activeMail;

		beforeEach(() => {
			activeMail = {
				some: 'thing'
			};
			spyOn(appStateService, 'getActiveMail').and.returnValue(activeMail);
			fixture.detectChanges();
		})

		it('has a mail header component with the mail set', () => {
			let mailHeader = fixture.debugElement.query(By.directive(MailHeaderComponent));
			expect(!!mailHeader).toBeTruthy();
			expect(mailHeader.componentInstance.mail).toBe(activeMail);
		});

		it('has a mail view component with the mail set', () => {
			let mailView = fixture.debugElement.query(By.directive(MailViewComponent));
			expect(!!mailView).toBeTruthy();
			expect(mailView.componentInstance.mail).toBe(activeMail);
		});
	});
});
