/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppStateService } from '../shared/app-state.service';
import { MailItemComponent } from '../mail-item/mail-item.component';
import { MailListComponent } from './mail-list.component';

describe('MailListComponent', () => {
	let component: MailListComponent;
	let fixture: ComponentFixture<MailListComponent>;
	let mails: any[];
	let appStateService: AppStateService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				MailItemComponent,
				MailListComponent
			],
			providers: [
				AppStateService
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		appStateService = TestBed.get(AppStateService);
		spyOn(appStateService, 'setActiveMail');
		fixture = TestBed.createComponent(MailListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should not display anything when mails is not set', () => {
		let mailItems = fixture.debugElement.queryAll(By.directive(MailItemComponent));
		expect(mailItems.length).toEqual(0);
	});

	it('should not display anything when mail list is empty', () => {
		component.mails = [];
		fixture.detectChanges();
		let mailItems = fixture.debugElement.queryAll(By.directive(MailItemComponent));
		expect(mailItems.length).toEqual(0);
	});

	it('should display a mail item for each mail in the list', () => {
		let mails = [{}, {}];
		component.mails = mails;
		fixture.detectChanges();
		let mailItems = fixture.debugElement.queryAll(By.directive(MailItemComponent));
		expect(mailItems.length).toEqual(2);
		mailItems.forEach((mailItem, i) => {
			expect(mailItem.componentInstance.mail).toBe(mails[i]);
		});
	});

	it('when a mail item is clicked, active mail is set in app state service', () => {
		let mails = [{}];
		component.mails = mails;
		fixture.detectChanges();
		let mailItems = fixture.debugElement.queryAll(By.directive(MailItemComponent));
		mailItems[0].nativeElement.click();
		fixture.detectChanges();
		expect(appStateService.setActiveMail).toHaveBeenCalledWith(mails[0]);
	});
});
