/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MD_DIALOG_DATA, MdDialogRef } from '@angular/material';

import { AppModule } from '../app.module';

import { Mail } from '../shared/mail';
import { Recipient } from '../shared/recipient';
import { Contact } from '../shared/contact';
import { MailFactoryService } from '../shared/mail-factory.service';
import { MailService } from '../shared/mail.service';
import { ContactService } from '../shared/contact.service';
import { QuoteService } from '../shared/quote.service';
import { RecipientSelectorComponent } from '../recipient-selector/recipient-selector.component';
import { MailEditorComponent } from '../mail-editor/mail-editor.component';
import { MailWriterComponent } from './mail-writer.component';

describe('MailWriterComponent', () => {
	let component: MailWriterComponent;
	let fixture: ComponentFixture<MailWriterComponent>;
	let mailService: any;
	let quoteService: QuoteService;
	let sendSpy: any;
	let mail: Mail;
	let mailCreatedFromWriter: Mail;
	let mailFactoryService: MailFactoryService;
	let myself: Contact;
	let recipient: Recipient;
	let createFromWriterSpy;
	let page: Page;

	function configureModuleWith(replyMail: Mail) {
		mail = replyMail;

		TestBed.configureTestingModule({
			imports: [AppModule],
			providers: [
				{
					provide: MD_DIALOG_DATA,
					useValue: replyMail
				},
				{
					provide: MdDialogRef,
					useClass: jasmine.createSpy('MdDialogRef')
				}
			]
		}).compileComponents();
	}

	function setupSpiesAndComponent() {
		recipient = new Recipient(new Contact('somebody@localhost'), 'to');
		mailCreatedFromWriter = new Mail(null, [], null, '<style>#mail-editor whatever { x: y; }</style>Something');

		mailService = TestBed.get(MailService);
		spyOn(mailService, 'send');

		myself = new Contact('me@mail.fr', 'me');
		let contactService = TestBed.get(ContactService);
		spyOn(contactService, 'getMyself').and.returnValue(myself);

		quoteService = TestBed.get(QuoteService);
		spyOn(quoteService, 'quote').and.returnValue('<blockquote>Quoted</blockquote>');

		mailFactoryService = TestBed.get(MailFactoryService);
		createFromWriterSpy = spyOn(mailFactoryService, 'createFromWriter')
		createFromWriterSpy.and.returnValue(mailCreatedFromWriter);

		fixture = TestBed.createComponent(MailWriterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		page = new Page();
	}

	function setContentWithStyles() {
		component.form.controls['content'].setValue('<style>#mail-editor whatever { x: y; }</style>' + mail.body);
	}

	describe('when creating a new mail', () => {
		beforeEach(async(() => {
			configureModuleWith(new Mail(null, [], null, null));
		}));

		beforeEach(() => {
			setupSpiesAndComponent();
		});

		it('the form is empty', () => {
			expect(component.form.value).toEqual({
				recipients: [],
				subject: null,
				content: null
			});
		});

		it('the form is invalid', () => {
			expect(component.form.valid).toBeFalsy();
		});

		it('the send button is disabled', () => {
			expect(page.sendButton.nativeElement.disabled).toBeTruthy();
		});
	});

	describe('when replying to my own mail', () => {
		let myMail: Mail;

		beforeEach(async(() => {
			let recipients = [new Recipient(new Contact('some@body'), 'to'), new Recipient(new Contact('another@body'), 'cc'), new Recipient(myself, 'cc')];
			myMail = new Mail(myself, recipients, 'Some subject', '<html><body>Some <b>body</b></body></html>')
			configureModuleWith(myMail);
		}));

		beforeEach(() => {
			setupSpiesAndComponent();
		});

		it('initializes form "to" recipients with myMail.to minus myself', () => {
			let formRecipients = component.form.controls['recipients'].value.filter(it => it.type === 'to');
			expect(formRecipients.length).toEqual(1);
			expect(formRecipients[0].address).toEqual('some@body');
		});

		it('initializes form "cc" recipients with myMail.cc minus myself', () => {
			let formRecipients = component.form.controls['recipients'].value.filter(it => it.type === 'cc');
			expect(formRecipients.length).toEqual(1);
			expect(formRecipients[0].address).toEqual('another@body');
		});
	});

	describe('when replying to somebody else\'s mail', () => {
		let replyMail: Mail;

		beforeEach(async(() => {
			let recipients = [new Recipient(new Contact('some@body'), 'to'), new Recipient(new Contact('another@body'), 'cc'), new Recipient(myself, 'cc')];
			replyMail = new Mail(new Contact('sender@mail', 'some.from'), recipients, 'Some subject', '<html><body>Some <b>body</b></body></html>')
			configureModuleWith(replyMail);
		}));

		beforeEach(() => {
			setupSpiesAndComponent();
		});

		it('initializes form "to" recipients with myMail.from', () => {
			let formRecipients = component.form.controls['recipients'].value.filter(it => it.type === 'to');
			expect(formRecipients.length).toEqual(1);
			expect(formRecipients[0].address).toEqual('sender@mail');
		});

		it('initializes form "cc" recipients with the sum of myMail.to and myMail.cc minus myself', () => {
			let formRecipients = component.form.controls['recipients'].value.filter(it => it.type === 'cc');
			expect(formRecipients.length).toEqual(2);
			expect(formRecipients[0].address).toEqual('some@body');
			expect(formRecipients[1].address).toEqual('another@body');
		});
	});

	describe('when replying to a mail with empty subject', () => {
		let replyMail: Mail;

		beforeEach(async(() => {
			replyMail = new Mail(myself, [], '', '')
			configureModuleWith(replyMail);
		}));

		beforeEach(() => {
			setupSpiesAndComponent();
		});

		it('subject is initialized with "Re:"', () => {
			expect(component.form.controls['subject'].value).toEqual('Re:');
		});
	});

	describe('when replying to a mail with subject that already contains a Re:', () => {
		let replyMail: Mail;

		beforeEach(async(() => {
			replyMail = new Mail(myself, [], 'RE: something', '')
			configureModuleWith(replyMail);
		}));

		beforeEach(() => {
			setupSpiesAndComponent();
		});

		it('the "Re:" prefix is not duplicated in the subject', () => {
			expect(component.form.controls['subject'].value).toEqual('RE: something');
		});
	});

	describe('when replying to any mail', () => {
		let replyMail: Mail;

		beforeEach(async(() => {
			let recipients = [new Recipient(new Contact('some@body'), 'to'), new Recipient(new Contact('another@body'), 'cc'), new Recipient(myself, 'cc')];
			replyMail = new Mail(new Contact('sender@mail', 'some.from'), recipients, 'Some subject', '<html><body>Some <b>body</b></body></html>')
			configureModuleWith(replyMail);
		}));

		beforeEach(() => {
			setupSpiesAndComponent();
		});

		it('the form is valid', () => {
			expect(component.form.valid).toBeTruthy();
		});

		it('the send button is enabled', () => {
			expect(page.sendButton.nativeElement.disabled).toBeFalsy();
		});

		it('the form becomes invalid when content is empty', () => {
			component.form.controls['content'].setValue('');
			expect(component.form.valid).toBeFalsy();
		});

		it('the form becomes invalid when no recipients are filled', () => {
			component.form.controls['recipients'].setValue([]);
			expect(component.form.valid).toBeFalsy();
		});

		it('subject is initialized with replyMail.subject, adding a "Re: " prefix', () => {
			expect(component.form.controls['subject'].value).toEqual('Re: Some subject');
		});

		it('the replyMail.body is quoted in content field', () => {
			let datePipe = TestBed.get(DatePipe);
			let formattedDate = datePipe.transform(replyMail.date, 'medium');
			expect(quoteService.quote).toHaveBeenCalledWith(replyMail);
			expect(component.form.controls['content'].value).toEqual(`<p></p><p>On ${formattedDate}, some.from wrote:</p><blockquote>Quoted</blockquote>`);
		});

		describe('the send button', () => {
			let sendButton: any;

			beforeEach(() => {
				sendButton = fixture.debugElement.query(By.css("button#send"));
			});

			it('should be disabled when the form is invalid', () => {
				component.form.controls['content'].setValue('');
				fixture.detectChanges();
				expect(sendButton.nativeElement.disabled).toBeTruthy();
			});

			it('should be enabled when the form is valid', () => {
				expect(sendButton.nativeElement.disabled).toBeFalsy();
			});

			it('should remove #mail-editor from content before sending', () => {
				setContentWithStyles();
				fixture.detectChanges();
				sendButton.nativeElement.click();
				fixture.detectChanges();
				expect(createFromWriterSpy.calls.argsFor(0)[0].content).toEqual('<style>whatever { x: y; }</style><html><body>Some <b>body</b></body></html>');
			});

			it('should create a mail from form data and call mailService.send with it', () => {
				sendButton.nativeElement.click();
				fixture.detectChanges();
				expect(mailFactoryService.createFromWriter).toHaveBeenCalledWith(component.form.value);
				expect(mailService.send).toHaveBeenCalledWith(mailCreatedFromWriter);
			});
		});
	});

	class Page {
		sendButton: DebugElement;

		constructor() {
			this.sendButton = fixture.debugElement.query(By.css("button#send"));
		}
	}
});
