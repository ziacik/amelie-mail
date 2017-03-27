/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailEditorComponent } from './mail-editor.component';

declare var tinymce;

describe('MailEditorComponent', () => {
	let component: MailEditorComponent;
	let fixture: ComponentFixture<MailEditorComponent>;
	let tinyMceOptions: any;
	let editor: any;
	let changeCallback: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MailEditorComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		editor  = {
			setContent: jasmine.createSpy('setContent'),
			getContent: jasmine.createSpy('getContent').and.returnValue('Some content.'),
			on: jasmine.createSpy('on').and.callFake((evt, callback) => {
				if (evt === 'change') {
					changeCallback = callback;
				}
			})
		};
		tinymce = {
			init: jasmine.createSpy('init').and.callFake(opt => {
				tinyMceOptions = opt;
				tinyMceOptions.setup(editor);
			}),
			remove: jasmine.createSpy('remove')
		};
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

	it('sets a value to tinymce when value is set on editor', () => {
		component.value = 'Some value.';
		expect(editor.setContent).toHaveBeenCalledWith('Some value.');
	});

	it('retrieves a value from tinymce when change event occurs', () => {
		changeCallback();
		expect(editor.getContent).toHaveBeenCalled();
		expect(component.value).toEqual('Some content.');
	});
});
