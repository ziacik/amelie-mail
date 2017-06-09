/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';
import { ContactService } from './shared/contact.service';
import { QuoteService } from './shared/quote.service';
import { MailEditorComponent } from './mail-editor/mail-editor.component';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailHeaderComponent } from './mail-header/mail-header.component';
import { MailViewComponent } from './mail-view/mail-view.component';
import { MailWriterComponent } from './mail-writer/mail-writer.component';
import { RecipientSelectorComponent } from './recipient-selector/recipient-selector.component';
import { AttachmentItemComponent } from './attachment-item/attachment-item.component';

describe('App: AmelieMail', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let appStateService: AppStateService;
	let mailService: MailService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AppComponent,
				MailListComponent,
				MailHeaderComponent,
				MailViewComponent,
				MailWriterComponent,
				MailEditorComponent,
				RecipientSelectorComponent,
				AttachmentItemComponent
			],
			providers: [
				AppStateService,
				MailService,
				ContactService,
				QuoteService,
				DatePipe
			],
			imports: [
				ReactiveFormsModule,
				MaterialModule,
				NoopAnimationsModule
			]
		});

		TestBed.overrideComponent(MailListComponent, {
			set: {
				template: '<div>Overridden template here</div>'
			}
		});

		TestBed.compileComponents();
	}));

	beforeEach(() => {
		appStateService = TestBed.get(AppStateService);
		mailService = TestBed.get(MailService);
		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('has a mail list component with mails property set to mailService.getMails', () => {
		let mails = [{}, {}];
		spyOn(mailService, 'getMails').and.returnValue(mails);
		fixture.detectChanges();
		let mailListComponent = fixture.debugElement.query(By.directive(MailListComponent));
		expect(!!mailListComponent).toBeTruthy();
		expect(mailListComponent.componentInstance.mails).toBe(mails);
	});
});
