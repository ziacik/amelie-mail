import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailViewComponent } from './mail-view/mail-view.component';
import { MailContentViewComponent } from './mail-content-view/mail-content-view.component';
import { MailItemComponent } from './mail-item/mail-item.component';
import { AppStateService } from './shared/app-state.service';

@NgModule({
	declarations: [
		AppComponent,
		MailListComponent,
		MailViewComponent,
		MailContentViewComponent,
		MailItemComponent
	],
	imports: [
		BrowserModule,
		CommonModule,
		FormsModule
	],
	providers: [
		AppStateService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
