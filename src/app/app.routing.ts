import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
	{
		path: '',
		component: AppComponent
	}
];

export const routing = RouterModule.forRoot(routes);
