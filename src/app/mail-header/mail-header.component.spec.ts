/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppModule } from '../app.module';
import { Mail } from '../shared/mail';
import { Contact } from '../shared/contact';
import { Recipient } from '../shared/recipient';
import { ContactService } from '../shared/contact.service';
import { MailService } from '../shared/mail.service';
import { MailHeaderComponent } from './mail-header.component';
import { AttachmentItemComponent } from '../attachment-item/attachment-item.component';

describe('MailHeaderComponent', () => {
	let component: MailHeaderComponent;
	let fixture: ComponentFixture<MailHeaderComponent>;
	let mailService: MailService;
	let mail: Mail;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [AppModule]
		}).compileComponents();
	}));

	beforeEach(() => {
		let from = new Contact('some.one@localhost', 'Some One');
		let recipients = [
			new Recipient(new Contact('first.recipient@localhost', 'First To'), 'to'),
			new Recipient(new Contact('second.recipient@localhost'), 'to'),
			new Recipient(new Contact('some.one@localhost', 'First Cc'), 'cc'),
			new Recipient(new Contact('second.cc@localhost'), 'cc')
		];
		let attachments = [{ one: 1 }, { two: 2 }];
		mail = new Mail(from, recipients, { subject: 'Some subject', attachments: attachments }, {}, { date : new Date(2017, 2, 3, 15, 50, 20, 153) });
		fixture = TestBed.createComponent(MailHeaderComponent);
		component = fixture.componentInstance;
		component.mail = mail;
		fixture.detectChanges();
		mailService = TestBed.get(MailService);
		spyOn(mailService, 'markSeen');
		spyOn(mailService, 'unmarkSeen');
	});

	it('should show a subject', () => {
		expect(fixture.debugElement.nativeElement.textContent).toContain('Some subject');
	});

	it('should show who is the mail from', () => {
		expect(fixture.debugElement.nativeElement.textContent).toContain('Some One');
	});

	it('should show who is the mail from even if she only has an address and no name', () => {
		delete mail.from['_name'];
		fixture.detectChanges();
		expect(fixture.debugElement.nativeElement.textContent).toContain('some.one@localhost');
	});

	it('should show when the mail has arrived', () => {
		expect(fixture.debugElement.nativeElement.textContent).toContain('2017');
	});

	it('should show who the mail is addressed to', () => {
		expect(fixture.debugElement.nativeElement.textContent).toContain('First To');
		expect(fixture.debugElement.nativeElement.textContent).toContain('second.recipient@localhost');
		expect(fixture.debugElement.nativeElement.textContent).toContain('First Cc');
		expect(fixture.debugElement.nativeElement.textContent).toContain('second.cc@localhost');
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

	xit('should have a Read button if the mail is unseen', () => {
		mail.unmarkSeen();
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#read'));
		expect(!!element).toBeTruthy();
	});

	xit('should not have a Read button if the mail is seen', () => {
		mail.markSeen();
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#read'));
		expect(!!element).toBeFalsy();
	});

	xit('should have an Unread button if the mail is seen', () => {
		mail.markSeen();
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#unread'));
		expect(!!element).toBeTruthy();
	});

	xit('should not have an Unread button if the mail is unseen', () => {
		mail.unmarkSeen();
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#unread'));
		expect(!!element).toBeFalsy();
	});

	xit('should call mailService.markSeen when Read button clicked and mark the mail seen', () => {
		mail.unmarkSeen();
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#read'));
		element.nativeElement.click();
		fixture.detectChanges();
		expect(mailService.markSeen).toHaveBeenCalledWith(mail);
		expect(mail.isSeen).toEqual(true);
	});

	xit('should call mailService.unmarkSeen when Unread button clicked and mark the mail unseen', () => {
		mail.markSeen();
		fixture.detectChanges();
		let element = fixture.debugElement.query(By.css('button#unread'));
		element.nativeElement.click();
		fixture.detectChanges();
		expect(mailService.unmarkSeen).toHaveBeenCalledWith(mail);
		expect(mail.isSeen).toEqual(false);
	});
});
