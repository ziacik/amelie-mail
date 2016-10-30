import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MailListComponent } from './mail-list/mail-list.component';
import { MailViewComponent } from './mail-view/mail-view.component';
import { MailContentViewComponent } from './mail-content-view/mail-content-view.component';
import { routing } from './app.routing';

@NgModule({
	declarations: [
		AppComponent,
		MailListComponent,
		MailViewComponent,
		MailContentViewComponent
	],
	imports: [
		BrowserModule,
		CommonModule,
		FormsModule,
		routing
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
