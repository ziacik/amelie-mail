/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppStateService } from '../shared/app-state.service';
import { MailViewComponent } from './mail-view.component';

fdescribe('MailViewComponent', () => {
	let component: MailViewComponent;
	let fixture: ComponentFixture<MailViewComponent>;
	let appStateService: AppStateService;
	let mail;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MailViewComponent],
			providers: [AppStateService]
		}).compileComponents();
		appStateService = TestBed.get(AppStateService);
		mail = {};
		spyOn(appStateService, 'getActiveMail').and.returnValue(mail);
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MailViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	describe('when bodyType is text/plain', () => {
		beforeEach(() => {
			mail.bodyType = 'text/plain';
			mail.body = 'some body';
			fixture.detectChanges();
		});

		it('should display a div with plain text contents', () => {
			let div = fixture.debugElement.query(By.css('div'));
			expect(!!div).toBeTruthy();
			expect(div.nativeElement.innerText).toEqual('some body');
		});

		it('should not display an iframe', () => {
			let iframe = fixture.debugElement.query(By.css('iframe'));
			expect(!!iframe).toBeFalsy();
		});
	});

	describe('when bodyType is text/html', () => {
		beforeEach(() => {
			mail.bodyType = 'text/html';
			mail.body = '<h1>some body</h1>';
			fixture.detectChanges();
		});

		it('should not display a div', () => {
			let div = fixture.debugElement.query(By.css('div'));
			expect(!!div).toBeFalsy();
		});

		it('should display an iframe with the html contents', () => {
			let iframe = fixture.debugElement.query(By.css('iframe'));
			expect(!!iframe).toBeTruthy();
			expect(iframe.nativeElement.srcdoc).toEqual('<h1>some body</h1>');
		});
	});
});
