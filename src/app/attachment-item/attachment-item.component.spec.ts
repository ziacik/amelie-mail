import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AttachmentItemComponent } from './attachment-item.component';

fdescribe('AttachmentItemComponent', () => {
	let component: AttachmentItemComponent;
	let fixture: ComponentFixture<AttachmentItemComponent>;
	let attachment: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AttachmentItemComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		attachment = {
			name: 'Something.ext',
			excid: 'some;excid'
		};
		fixture = TestBed.createComponent(AttachmentItemComponent);
		component = fixture.componentInstance;
		component.attachment = attachment;
		fixture.detectChanges();
	});

	it('displays a name of an attachment', () => {
		let a = fixture.debugElement.query(By.css('a'));
		expect(a.nativeElement.innerText).toContain(attachment.name);
	});

	it('contains a link to the attachment', () => {
		let a = fixture.debugElement.query(By.css('a'));
		expect(a.nativeElement.href).toEqual('excid:' + attachment.excid);
	});

	it('the link show have a download attribute set to the name of the attachment', () => {
		let a = fixture.debugElement.query(By.css('a'));
		expect(a.nativeElement.getAttribute('download')).toEqual(attachment.name);
	});
});
