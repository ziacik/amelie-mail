import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MailContentViewComponent } from './mail-content-view/mail-content-view.component';

export const routes: Routes = [
	{
		path: '',
		component: AppComponent,
		children: [{
			path: 'view',
			component: MailContentViewComponent
		}]
	}
];

export const routing = RouterModule.forRoot(routes);
