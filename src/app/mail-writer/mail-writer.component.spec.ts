/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

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
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MailWriterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

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
});
