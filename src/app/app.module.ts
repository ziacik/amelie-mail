import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailViewComponent } from './mail-view/mail-view.component';
import { MailItemComponent } from './mail-item/mail-item.component';
import { MailHeaderComponent } from './mail-header/mail-header.component';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';
import { MailFactoryService } from './shared/mail-factory.service';
import { ContactService } from './shared/contact.service';
import { QuoteService } from './shared/quote.service';
import { MailEditorComponent } from './mail-editor/mail-editor.component';
import { MailWriterComponent } from './mail-writer/mail-writer.component';
import { RecipientSelectorComponent } from './recipient-selector/recipient-selector.component';
import { AttachmentItemComponent } from './attachment-item/attachment-item.component';
import { MaterialModule } from '@angular/material';

@NgModule({
	declarations: [
		AppComponent,
		MailListComponent,
		MailViewComponent,
		MailItemComponent,
		MailHeaderComponent,
		MailEditorComponent,
		MailWriterComponent,
		RecipientSelectorComponent,
		AttachmentItemComponent
	],
	entryComponents: [MailWriterComponent],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		MaterialModule
	],
	providers: [
		AppStateService,
		MailService,
		MailFactoryService,
		ContactService,
		QuoteService,
		DatePipe
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
