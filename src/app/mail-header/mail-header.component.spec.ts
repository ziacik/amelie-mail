/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ContactService } from '../shared/contact.service';
import { MailService } from '../shared/mail.service';
import { MailHeaderComponent } from './mail-header.component';
import { AttachmentItemComponent } from '../attachment-item/attachment-item.component';

describe('MailHeaderComponent', () => {
	let component: MailHeaderComponent;
	let fixture: ComponentFixture<MailHeaderComponent>;
	let mailService: MailService;
	let mail: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AttachmentItemComponent, MailHeaderComponent],
			providers: [MailService, ContactService],
			imports: [NoopAnimationsModule, MaterialModule]
		}).compileComponents();
	}));

	beforeEach(() => {
		mail = {
			subject: 'Some subject',
			receivedAt: new Date(2017, 2, 3, 15, 50, 20, 153),
			attachments: [{ one: 1 }, { two: 2 }],
			from: [
				{
					name: 'Some One',
					address: 'some.one@localhost'
				}
			],
			to: [
				{
					name: 'First To',
					address: 'first.recipient@localhost',
				}, {
					address: 'second.recipient@localhost',
				}
			],
			cc: [
				{
					name: 'First Cc',
					address: 'some.one@localhost'
				}, {
					address: 'second.cc@localhost'
				}
			]
		};
		fixture = TestBed.createComponent(MailHeaderComponent);
		component = fixture.componentInstance;
		component.mail = mail;
		fixture.detectChanges();
		mailService = TestBed.get(MailService);
		spyOn(mailService, 'markSeen');
		spyOn(mailService, 'unmarkSeen');
	});

	it('should show subject of an active mail in h1', () => {
		let h1 = fixture.debugElement.query(By.css('h1'));
		expect(!!h1).toBeTruthy();
		expect(h1.nativeElement.innerText).toEqual('Some subject');
	});

	it('should show who is the active mail from', () => {
		let element = fixture.debugElement.query(By.css('.from'));
		expect(!!element).toBeTruthy();
		expect(element.nativeElement.innerText).toEqual('From Some One');
	});

	it('should show who is the active mail from even if she only has an address and no name', () => {
		delete mail.from[0].name;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('.from'));
		expect(!!element).toBeTruthy();
		expect(element.nativeElement.innerText).toEqual('From some.one@localhost');
	});

	it('should show when the mail has arrived', () => {
		let element = fixture.debugElement.query(By.css('.date'));
		expect(!!element).toBeTruthy();
		// TODO expect(element.nativeElement.innerText).toEqual('Some One');
	});

	it('should show who the mail is addressed to', () => {
		let element = fixture.debugElement.query(By.css('.to'));
		expect(!!element).toBeTruthy();
		expect(element.nativeElement.innerText).toEqual('To First To, second.recipient@localhost, First Cc, second.cc@localhost');
	});

	it('should show an attachment item for each attachment', () => {
		let items = fixture.debugElement.queryAll(By.directive(AttachmentItemComponent));
		expect(items.length).toEqual(2);
		expect(items[0].componentInstance.attachment).toBe(mail.attachments[0]);
		expect(items[1].componentInstance.attachment).toBe(mail.attachments[1]);
	});


	it('should have a Reply button', () => {
		let element = fixture.debugElement.query(By.css('button#reply'));
		expect(!!element).toBeTruthy();
	});

	it('should have a Read button if the mail is unseen', () => {
		mail.isSeen = false;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#read'));
		expect(!!element).toBeTruthy();
	});

	it('should not have a Read button if the mail is seen', () => {
		mail.isSeen = true;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#read'));
		expect(!!element).toBeFalsy();
	});

	it('should have an Unread button if the mail is seen', () => {
		mail.isSeen = true;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#unread'));
		expect(!!element).toBeTruthy();
	});

	it('should not have an Unread button if the mail is unseen', () => {
		mail.isSeen = false;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#unread'));
		expect(!!element).toBeFalsy();
	});

	it('should call mailService.markSeen when Read button clicked and mark the mail seen', () => {
		mail.isSeen = false;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#read'));
		element.nativeElement.click();
		fixture.detectChanges();
		expect(mailService.markSeen).toHaveBeenCalledWith(mail);
		expect(mail.isSeen).toEqual(true);
	});

	it('should call mailService.unmarkSeen when Unread button clicked and mark the mail unseen', () => {
		mail.isSeen = true;
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#unread'));
		element.nativeElement.click();
		fixture.detectChanges();
		expect(mailService.unmarkSeen).toHaveBeenCalledWith(mail);
		expect(mail.isSeen).toEqual(false);
	});
});
