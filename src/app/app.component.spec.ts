/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('App: AmelieMail', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				AppComponent
			],
		});
	});

	it('should create the app', async(() => {
		let fixture = TestBed.createComponent(AppComponent);
		let app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	}));

	it(`should have a title`, async(() => {
		let fixture = TestBed.createComponent(AppComponent);
		let app = fixture.debugElement.componentInstance;
		expect(app.title).toEqual('Amelie Mail');
	}));

	it('should render title in a h1 tag', async(() => {
		let fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		let compiled = fixture.debugElement.nativeElement;
		expect(compiled.querySelector('h1').textContent).toContain('Amelie Mail');
	}));
});
