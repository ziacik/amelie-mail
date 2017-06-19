/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mail } from '../shared/mail';
import { Contact } from '../shared/contact';
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
		let from: Contact = new Contact('amelie@some', 'Amelie Some');
		mail = new Mail(from, [], { subject: 'Save the world', preview: 'A preview of how to save the world.'});
		fixture = TestBed.createComponent(MailItemComponent);
		component = fixture.componentInstance;
		component.mail = mail;
		fixture.detectChanges();
	});

	it('should display from', () => {
		expect(fixture.nativeElement.textContent).toContain('Amelie Some');
	});

	it('should display a subject', () => {
		expect(fixture.nativeElement.textContent).toContain('Save the world');
	});

	it('should display a plain text preview', () => {
		expect(fixture.nativeElement.textContent).toContain('A preview of how to save the world.');
	});
});
