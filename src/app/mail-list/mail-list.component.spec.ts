/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailItemComponent } from '../mail-item/mail-item.component';
import { MailListComponent } from './mail-list.component';

describe('MailListComponent', () => {
	let component: MailListComponent;
	let fixture: ComponentFixture<MailListComponent>;
	let mails: any[];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				MailItemComponent,
				MailListComponent
			]
		}).compileComponents();
	}));

	beforeEach(() => {
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
});
