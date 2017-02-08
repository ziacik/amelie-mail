/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';

import { MailService } from '../shared/mail.service';
import { ContactService } from '../shared/contact.service';
import { RecipientSelectorComponent } from '../recipient-selector/recipient-selector.component';
import { MailEditorComponent } from '../mail-editor/mail-editor.component';
import { MailWriterComponent } from './mail-writer.component';

describe('MailWriterComponent', () => {
	let component: MailWriterComponent;
	let fixture: ComponentFixture<MailWriterComponent>;
	let mailService: MailService;
	let mailToSend: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				MailWriterComponent,
				RecipientSelectorComponent,
				MailEditorComponent
			],
			providers: [
				MailService,
				ContactService
			],
			imports: [
				ReactiveFormsModule
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MailWriterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		mailService = TestBed.get(MailService);
		spyOn(mailService, 'send');

		let contactService = TestBed.get(ContactService);
		spyOn(contactService, 'getMyself').and.returnValue({
			name: 'me',
			address: 'me@mail.fr'
		});
	});

	function fillValidForm() {
		mailToSend = {
			to: ['somebody@localhost'],
			cc: ['someone@localhost'],
			subject: 'This is a mail',
			content: 'This is a content of the mail'
		};
		component.form.controls['to'].setValue(mailToSend.to);
		component.form.controls['cc'].setValue(mailToSend.cc);
		component.form.controls['subject'].setValue(mailToSend.subject);
		component.form.controls['content'].setValue(mailToSend.content);
	}

	it('should have a to field', () => {
		let field = fixture.debugElement.query(By.css("#to"));
		expect(!!field).toBeTruthy();
	});

	it('should have a cc field', () => {
		let field = fixture.debugElement.query(By.css("#cc"));
		expect(!!field).toBeTruthy();
	});

	it('should have a subject field', () => {
		let field = fixture.debugElement.query(By.css("#subject"));
		expect(!!field).toBeTruthy();
	});

	it('should have a mail editor', () => {
		let editor = fixture.debugElement.query(By.directive(MailEditorComponent));
		expect(!!editor).toBeTruthy();
	});

	it('should have a send button', () => {
		let button = fixture.debugElement.query(By.css("button#send"));
		expect(!!button).toBeTruthy();
	});

	it('should have a cancel button', () => {
		let button = fixture.debugElement.query(By.css("button#cancel"));
		expect(!!button).toBeTruthy();
	});

	it('should have a form with all the needed controls', () => {
		expect(component.form).toBeTruthy();
		expect(Object.keys(component.form.controls)).toEqual(['to', 'cc', 'subject', 'content']);
	});

	describe('the form', () => {
		it('should be invalid initially', () => {
			expect(component.form.valid).toBeFalsy();
		});

		it('should be valid when all is filled', () => {
			fillValidForm();
			expect(component.form.valid).toBeTruthy();
		});

		it('should be invalid when content is empty', () => {
			fillValidForm();
			component.form.controls['content'].setValue('');
			expect(component.form.valid).toBeFalsy();
		});

		it('should be invalid when neither to nor cc is filled', () => {
			fillValidForm();
			component.form.controls['to'].setValue('');
			component.form.controls['cc'].setValue('');
			expect(component.form.valid).toBeFalsy();
		});

		it('should be valid when to is filled and cc is not', () => {
			fillValidForm();
			component.form.controls['cc'].setValue('');
			expect(component.form.valid).toBeTruthy();
		});

		it('should be valid when cc is filled and to is not', () => {
			fillValidForm();
			component.form.controls['to'].setValue('');
			expect(component.form.valid).toBeTruthy();
		});
	});

	describe('the send button', () => {
		let sendButton: any;

		beforeEach(() => {
			sendButton = fixture.debugElement.query(By.css("button#send"));
		});

		it('should be disabled when the form is invalid', () => {
			expect(sendButton.nativeElement.disabled).toBeTruthy();
		});

		it('should be enabled when the form is valid', () => {
			fillValidForm();
			fixture.detectChanges();
			expect(sendButton.nativeElement.disabled).toBeFalsy();
		});

		it('should call mailService.send when send button clicked', () => {
			fillValidForm();
			fixture.detectChanges();
			sendButton.nativeElement.click();
			fixture.detectChanges();
			expect(mailService.send).toHaveBeenCalledWith(mailToSend);
		});
	});

	describe('open', () => {
		beforeEach(() => {
			fillValidForm();
			component.open();
		});

		it('clears the form', () => {
			expect(component.form.controls['to'].value).toEqual([]);
			expect(component.form.controls['cc'].value).toEqual([]);
			expect(component.form.controls['subject'].value).toEqual('');
			expect(component.form.controls['content'].value).toEqual('');
		});
	});

	describe('openReply', () => {
		let replyMail;

		beforeEach(() => {
			replyMail = {
				from: [{ name: 'some.from', address: 'some.from@mail.fr' }, { name: 'another.from', address: 'another.from@mail.fr' }],
				to: [{ name: 'me', address: 'me@mail.fr' }, { name: 'somebody.else', address: 'somebody.else@mail.com' }],
				cc: [{ name: 'cced', address: 'cced@mail.fr' }, { name: 'anothercc', address: 'anothercc@mail.is' }],
				subject: 'Some subject',
				date: new Date(2017, 4, 20, 12, 30, 50, 123),
				body: '<html><body>Some <b>body</b></body></html>'
			};
			component.openReply(replyMail);
		});

		it('does not fail when the replyMail has no fields set', () => {
			expect(() => component.openReply({})).not.toThrow();
		});

		it('sets from to the "to" field if i am not in the replyMail.from', () => {
			expect(component.form.controls['to'].value).toEqual(['some.from@mail.fr', 'another.from@mail.fr']);
		});

		it('sets sum of to and cc minus myself to the "cc" field if i am not in the replyMail.from', () => {
			expect(component.form.controls['cc'].value).toEqual(['somebody.else@mail.com', 'cced@mail.fr', 'anothercc@mail.is']);
		});

		it('sets sum of from and to minus myself to the "to" field if i am in the replyMail.from', () => {
			replyMail.from.push({ name: 'me', address: 'me@mail.fr' });
			component.openReply(replyMail);
			expect(component.form.controls['to'].value).toEqual(['some.from@mail.fr', 'another.from@mail.fr', 'somebody.else@mail.com']);
		});

		it('sets cc minus myself to the "cc" field if i am in the replyMail.from', () => {
			replyMail.from.push({ name: 'me', address: 'me@mail.fr' });
			component.openReply(replyMail);
			expect(component.form.controls['to'].value).toEqual(['some.from@mail.fr', 'another.from@mail.fr', 'somebody.else@mail.com']);
		});

		it('sets subject to the "subject" field, adding a "Re: " prefix', () => {
			expect(component.form.controls['subject'].value).toEqual('Re: Some subject');
		});

		it('sets just "Re:" to the "subject" field if replyMail subject is empty', () => {
			replyMail.subject = '';
			component.openReply(replyMail);
			expect(component.form.controls['subject'].value).toEqual('Re:');
		});

		it('does not duplicate an already existing "Re:" prefix in the subject', () => {
			let prefixes = ['Re:', 'RE:', 'Re: '];
			prefixes.forEach(prefix => {
				replyMail.subject = `${prefix}Something`;
				component.openReply(replyMail);
				expect(component.form.controls['subject'].value).toEqual(`${prefix}Something`);
			});
		});

		it('quotes content in the "content" field', () => {
			// TODO Review. Tinymce strips the <html> part from the blockquote, but still maybe we should do it first.
			expect(component.form.controls['content'].value).toEqual('<p></p><p>On Sat May 20 2017 12:30:50 GMT+0200 (CEST), some.from wrote:</p><blockquote><html><body>Some <b>body</b></body></html></blockquote>');
		});
	});
});
