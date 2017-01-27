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

	it('should initialize tinymce', () => {
		expect(tinymce.init).toHaveBeenCalled();
	});

	it('should remove tinymce in OnDestroy', () => {
		component.ngOnDestroy();
		expect(tinymce.remove).toHaveBeenCalled();
	});

});
