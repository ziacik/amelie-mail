import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Contact } from '../shared/contact';
import { Recipient } from '../shared/recipient';
import { ContactService } from '../shared/contact.service';
import { RecipientSelectorComponent } from './recipient-selector.component';

import { MdAutocomplete } from '@angular/material';
import { MdChipList, MdChip } from '@angular/material';

fdescribe('RecipientSelectorComponent', () => {
	let component: RecipientSelectorComponent;
	let contactService: ContactService;
	let fixture: ComponentFixture<RecipientSelectorComponent>;
	let contact1: Contact;
	let contact2: Contact;
	let recipient1: Recipient;
	let recipient2: Recipient;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RecipientSelectorComponent],
			providers: [ContactService],
			imports: [ReactiveFormsModule, NoopAnimationsModule, MaterialModule]
		}).compileComponents();
	}));

	beforeEach(() => {
		contactService = TestBed.get(ContactService);
		contact1 = new Contact('amelie.p@mail.fr', 'Amelie P');
		contact2 = new Contact('olivia.r@mail.fr');
		recipient1 = new Recipient(contact1, 'to');
		recipient2 = new Recipient(contact2, 'cc');
		spyOn(contactService, 'getAll').and.returnValue([contact1, contact2]);
		fixture = TestBed.createComponent(RecipientSelectorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('can have a placeholder', () => {
		component.placeholder = 'Whatever';
		fixture.detectChanges();
		let input = fixture.debugElement.query(By.css('input'));
		expect(input.componentInstance.placeholder).toEqual('Whatever');
	});

	it('contains a menu with all the contacts', () => {
		expect(contactService.getAll).toHaveBeenCalled();
		let autocomplete: MdAutocomplete = fixture.debugElement.query(By.directive(MdAutocomplete)).componentInstance;
		expect(autocomplete.options.length).toEqual(2);
		expect(autocomplete.options.first.value).toEqual(contact1);
		expect(autocomplete.options.first.viewValue).toEqual('Amelie P');
		expect(autocomplete.options.last.value).toEqual(contact2);
		expect(autocomplete.options.last.viewValue).toEqual('olivia.r@mail.fr');
	});

	it('setting a value creates chips with contacts', () => {
		component.value = [recipient1, recipient2];
		fixture.detectChanges();
		let chipList: MdChipList = fixture.debugElement.query(By.directive(MdChipList)).componentInstance;
		expect(chipList.chips.length).toEqual(2);
	});

	it('writeValue creates chips with contacts', () => {
		component.writeValue([recipient1, recipient2]);
		fixture.detectChanges();
		let chipList: MdChipList = fixture.debugElement.query(By.directive(MdChipList)).componentInstance;
		expect(chipList.chips.length).toEqual(2);
	});

	it('setting a value triggers onChangeCallback', () => {
		let callback = jasmine.createSpy('onChangeCallback');
		component.registerOnChange(callback);
		component.value = [recipient1, recipient2];
		expect(callback).toHaveBeenCalledWith([recipient1, recipient2]);
	});

	it('pressing enter in the Recipients input adds a recipient if it is not empty and clear the value', () => {
		spyOn(component, 'addRecipient');
		let input = fixture.debugElement.query(By.css('input'));
		input.nativeElement.value = 'some@address';
		input.triggerEventHandler('keyup.enter', {});
		fixture.detectChanges();
		expect(input.nativeElement.value).toBeFalsy();
		expect(component.addRecipient).toHaveBeenCalledWith('some@address');
	});

	it('pressing enter in the Recipients does not add a recipient if it is empty', () => {
		spyOn(component, 'addRecipient');
		let input = fixture.debugElement.query(By.css('input'));
		input.triggerEventHandler('keyup.enter', {});
		fixture.detectChanges();
		expect(component.addRecipient).not.toHaveBeenCalled();
	});

	it('blurring Recipients input adds a recipient if it is not empty and clears the value', () => {
		spyOn(component, 'addRecipient');
		let input = fixture.debugElement.query(By.css('input'));
		input.nativeElement.value = 'some@address';
		input.triggerEventHandler('blur', {});
		fixture.detectChanges();
		expect(input.nativeElement.value).toBeFalsy();
		expect(component.addRecipient).toHaveBeenCalledWith('some@address');
	});

	it('blurring Recipients input does not add a recipient if it is empty', () => {
		spyOn(component, 'addRecipient');
		let input = fixture.debugElement.query(By.css('input'));
		input.triggerEventHandler('blur', {});
		fixture.detectChanges();
		expect(component.addRecipient).not.toHaveBeenCalled();
	});

	it('when adding a recipient, contactService is used to search for the contact', () => {
		spyOn(contactService, 'getByAddress').and.returnValue(contact1);
		component.addRecipient('amelie.p@mail.fr');
		expect(contactService.getByAddress).toHaveBeenCalledWith('amelie.p@mail.fr');
		expect(component.value.length).toEqual(1);
		expect(component.value[0].contact.name).toEqual('Amelie P');
		expect(component.value[0].contact.address).toEqual('amelie.p@mail.fr');
		expect(component.value[0].type).toEqual('to');
	});

	it('when adding a recipient, if the contact is not found via contactService, a new contact is created', () => {
		component.addRecipient('unknown@address');
		expect(component.value.length).toEqual(1);
		expect(component.value[0].contact.name).toEqual(null);
		expect(component.value[0].contact.address).toEqual('unknown@address');
		expect(component.value[0].type).toEqual('to');
	});

	it('to recipients have primary color, cc has accent color, bcc has neutral color', () => {
		component.writeValue([new Recipient(contact1, 'to'), new Recipient(contact1, 'cc'), new Recipient(contact1, 'bcc')]);
		fixture.detectChanges();
		let chipList: MdChipList = fixture.debugElement.query(By.directive(MdChipList)).componentInstance;
		let chips: MdChip[] = chipList.chips.toArray();
		expect(chips[0].color).toEqual('primary');
		expect(chips[1].color).toEqual('accent');
		expect(chips[2].color).toBeFalsy();
	});

});
