import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailViewComponent } from './mail-view/mail-view.component';
import { MailContentViewComponent } from './mail-content-view/mail-content-view.component';
import { MailItemComponent } from './mail-item/mail-item.component';
import { MailHeaderComponent } from './mail-header/mail-header.component';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';
import { ContactService } from './shared/contact.service';
import { MailEditorComponent } from './mail-editor/mail-editor.component';
import { MailWriterComponent } from './mail-writer/mail-writer.component';
import { RecipientSelectorComponent } from './recipient-selector/recipient-selector.component';
import { AttachmentItemComponent } from './attachment-item/attachment-item.component';

@NgModule({
	declarations: [
		AppComponent,
		MailListComponent,
		MailViewComponent,
		MailContentViewComponent,
		MailItemComponent,
		MailHeaderComponent,
		MailEditorComponent,
		MailWriterComponent,
		RecipientSelectorComponent,
		AttachmentItemComponent
	],
	imports: [
		BrowserModule,
		CommonModule,
		ReactiveFormsModule
	],
	providers: [
		AppStateService,
		MailService,
		ContactService,
		DatePipe
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
