/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';

import { MailEditorComponent } from '../mail-editor/mail-editor.component';
import { MailWriterComponent } from './mail-writer.component';

fdescribe('MailWriterComponent', () => {
	let component: MailWriterComponent;
	let fixture: ComponentFixture<MailWriterComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				MailWriterComponent,
				MailEditorComponent
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
	});

	function fillValidForm() {
		component.form.controls['to'].setValue(['somebody@localhost']);
		component.form.controls['cc'].setValue(['someone@localhost']);
		component.form.controls['subject'].setValue('This is a mail');
		component.form.controls['content'].setValue('This is a content of the mail');
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
	});
});
