/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailEditorComponent } from './mail-editor.component';

describe('MailEditorComponent', () => {
	let component: MailEditorComponent;
	let fixture: ComponentFixture<MailEditorComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MailEditorComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MailEditorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
