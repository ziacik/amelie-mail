/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mail } from '../shared/mail';

import { MailItemComponent } from './mail-item.component';

describe('MailItemComponent', () => {
	let component: MailItemComponent;
	let fixture: ComponentFixture<MailItemComponent>;
	let mail: Mail;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MailItemComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		mail = new Mail();
		mail.from = [
			{
				name: 'Amelie Some',
				address: 'amelie@some'
			}, {
				address: 'only@address'
			}
		];
		mail.subject = 'Save the world';
		mail.preview = 'A preview of how to save the world.';
		fixture = TestBed.createComponent(MailItemComponent);
		component = fixture.componentInstance;
		component.mail = mail;
		fixture.detectChanges();
	});

	it('should display "Unknown" if "from" is undefined"', () => {
		delete mail.from;
		fixture.detectChanges();
		let field = fixture.debugElement.query(By.css('h5'));
		expect(field).toBeTruthy();
		expect(field.nativeElement.innerText).toEqual('UNKNOWN');
	});

	it('should display "Unknown" if "from" is empty"', () => {
		mail.from = [];
		fixture.detectChanges();
		let field = fixture.debugElement.query(By.css('h5'));
		expect(field).toBeTruthy();
		expect(field.nativeElement.innerText).toEqual('UNKNOWN');
	});

	it('should display "from" names and addresses', () => {
		let field = fixture.debugElement.query(By.css('h5'));
		expect(field).toBeTruthy();
		expect(field.nativeElement.innerText).toEqual('AMELIE SOME, ONLY@ADDRESS');
	});

	it('should display a subject', () => {
		let field = fixture.debugElement.query(By.css('h4'));
		expect(field).toBeTruthy();
		expect(field.nativeElement.innerText).toEqual(mail.subject);
	});

	it('should display a preview', () => {
		let field = fixture.debugElement.query(By.css('.description'));
		expect(field).toBeTruthy();
		expect(field.nativeElement.innerText).toEqual(mail.preview);
	});

	it('should not have an unseen class when the mail is seen', () => {
		mail.isSeen = true;
		fixture.detectChanges();
		expect(fixture.nativeElement.classList.contains('unseen')).toBeFalsy();
	});

	it('should have an unseen class when the mail is unseen', () => {
		mail.isSeen = false;
		fixture.detectChanges();
		expect(fixture.nativeElement.classList.contains('unseen')).toBeTruthy();
	});
});
