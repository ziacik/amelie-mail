/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';
import { MailListComponent } from './mail-list/mail-list.component';

describe('App: AmelieMail', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let appStateService: AppStateService;
	let mailService: MailService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				AppModule
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
		mailService = TestBed.get(MailService);
		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('has a mail list component with mails property set to mailService.getMails', () => {
		let mails = [{}, {}];
		spyOn(mailService, 'getMails').and.returnValue(mails);
		fixture.detectChanges();
		let mailListComponent = fixture.debugElement.query(By.directive(MailListComponent));
		expect(!!mailListComponent).toBeTruthy();
		expect(mailListComponent.componentInstance.mails).toBe(mails);
	});
});
