/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppStateService } from '../shared/app-state.service';
import { MailHeaderComponent } from './mail-header.component';

describe('MailHeaderComponent', () => {
	let component: MailHeaderComponent;
	let fixture: ComponentFixture<MailHeaderComponent>;
	let appStateService: AppStateService;
	let mail: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MailHeaderComponent],
			providers: [AppStateService]
		}).compileComponents();
	}));

	beforeEach(() => {
		mail = {
			subject: 'Some subject',
			receivedAt: new Date(2017, 2, 3, 15, 50, 20, 153),
			from: [{
				name: 'Some One',
				address: 'some.one@localhost'
			}],
			to: [{
				name: 'First To',
				address: 'first.recipient@localhost',
			}, {
					address: 'second.recipient@localhost',
				}],
			cc: [{
				name: 'First Cc',
				address: 'some.one@localhost'
			}, {
					address: 'second.cc@localhost'
				}]
		};
		appStateService = TestBed.get(AppStateService);
		spyOn(appStateService, 'getActiveMail').and.returnValue(mail);
		fixture = TestBed.createComponent(MailHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should show subject of an active mail in h1', () => {
		let h1 = fixture.debugElement.query(By.css('h1'));
		expect(!!h1).toBeTruthy();
		expect(h1.nativeElement.innerText).toEqual('Some subject');
	});

	it('should show who is the active mail from', () => {
		let element = fixture.debugElement.query(By.css('.from'));
		expect(!!element).toBeTruthy();
		expect(element.nativeElement.innerText).toEqual('Some One');
	});

	it('should show who is the active mail from even if she only has an address and no name', () => {
		delete mail.from[0].name;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('.from'));
		expect(!!element).toBeTruthy();
		expect(element.nativeElement.innerText).toEqual('some.one@localhost');
	});

	it('should show when the mail has arrived', () => {
		let element = fixture.debugElement.query(By.css('.date'));
		expect(!!element).toBeTruthy();
		// TODO expect(element.nativeElement.innerText).toEqual('Some One');
	});

	it('should show who the mail is addressed to', () => {
		let element = fixture.debugElement.query(By.css('.to'));
		expect(!!element).toBeTruthy();
		expect(element.nativeElement.innerText).toEqual('First To, second.recipient@localhost, First Cc, second.cc@localhost');
	});

	it('should have a reply button', () => {
		let element = fixture.debugElement.query(By.css('button.reply'));
		expect(!!element).toBeTruthy();
	});
});
