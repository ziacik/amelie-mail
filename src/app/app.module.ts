import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MailListComponent } from './mail-list/mail-list.component';

@NgModule({
	declarations: [
		AppComponent,
		MailListComponent
	],
	imports: [
		BrowserModule,
		CommonModule,
		FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
