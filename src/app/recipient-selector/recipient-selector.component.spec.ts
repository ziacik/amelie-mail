/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ContactService } from '../shared/contact.service';
import { RecipientSelectorComponent } from './recipient-selector.component';

describe('RecipientSelectorComponent', () => {
	let component: RecipientSelectorComponent;
	let contactService: ContactService;
	let fixture: ComponentFixture<RecipientSelectorComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RecipientSelectorComponent],
			providers: [ContactService]
		}).compileComponents();
	}));

	beforeEach(() => {
		contactService = TestBed.get(ContactService);
		spyOn(contactService, 'getAll').and.returnValue([
			{
				name: 'Amelie P',
				address: 'amelie.p@mail.fr'
			}, {
				address: 'olivia.r@mail.fr'
			}
		]);
		jQueryInstance.dropdown = jasmine.createSpy('dropdown');
		fixture = TestBed.createComponent(RecipientSelectorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('can have a placeholder', () => {
		component.placeholder = 'Whatever';
		fixture.detectChanges();
		let input = fixture.debugElement.query(By.css('.default.text'));
		expect(input.nativeElement.innerText).toEqual('Whatever');
	});

	it('creates a dropdown and binds to change event', () => {
		expect(jQuery).toHaveBeenCalledWith(jasmine.any(Object));
		expect(jQueryInstance.dropdown).toHaveBeenCalledWith({
			allowAdditions: true,
			fullTextSearch: true,
			forceSelection: false,
			showOnFocus: false,
			onChange: jasmine.any(Function)
		});
	});

	it('contains a menu with all the contacts', () => {
		expect(contactService.getAll).toHaveBeenCalled();
		let items = fixture.debugElement.queryAll(By.css('.item'));
		expect(items.length).toEqual(2);
		expect(items[0].nativeElement.getAttribute('data-value')).toEqual('amelie.p@mail.fr');
		expect(items[1].nativeElement.getAttribute('data-value')).toEqual('olivia.r@mail.fr');
	});

	it('setting a value sets the value to the dropdown', () => {
		component.value = ['one', 'two'];
		expect(jQueryInstance.dropdown).toHaveBeenCalledWith('set exactly', ['one', 'two']);
	});

	it('setting a value stores the value', () => {
		component.value = ['one', 'two'];
		expect(component.value).toEqual(['one', 'two']);
	});

	it('setting a value triggers onChangeCallback', () => {
		component.onChangeCallback = jasmine.createSpy('onChangeCallback');
		component.value = ['one', 'two'];
		expect(component.onChangeCallback).toHaveBeenCalledWith(['one', 'two']);
	});

	it('writing a value sets the value to the dropdown', () => {
		component.writeValue(['one', 'two']);
		expect(jQueryInstance.dropdown).toHaveBeenCalledWith('set exactly', ['one', 'two']);
	});

	it('writing a value stores the value', () => {
		component.writeValue(['one', 'two']);
		expect(component.value).toEqual(['one', 'two']);
	});

	it('writing a value triggers onChangeCallback', () => {
		component.onChangeCallback = jasmine.createSpy('onChangeCallback');
		component.writeValue(['one', 'two']);
		expect(component.onChangeCallback).toHaveBeenCalledWith(['one', 'two']);
	});

	it('setting the same value does not trigger another onChangeCallback', () => {
		component.onChangeCallback = jasmine.createSpy('onChangeCallback');
		component.value = ['one', 'two'];
		component.value = ['one', 'two'];
		expect(component.onChangeCallback.calls.count()).toEqual(1);
	});

	it('setting different value triggers another onChangeCallback', () => {
		component.onChangeCallback = jasmine.createSpy('onChangeCallback');
		component.value = ['one', 'two'];
		component.value = ['one', 'three'];
		expect(component.onChangeCallback.calls.count()).toEqual(2);
	});

	it('triggers onChangeCallback when dropdown changes its value', () => {
		component.onChangeCallback = jasmine.createSpy('onChangeCallback');
		let initArgs = jQueryInstance.dropdown.calls.argsFor(0)[0];
		initArgs.onChange('one,another');
		expect(component.onChangeCallback).toHaveBeenCalledWith(['one', 'another']);
	});

	it('triggers onTouchedCallback when dropdown changes its value', () => {
		component.onTouchedCallback = jasmine.createSpy('onTouchedCallback');
		let initArgs = jQueryInstance.dropdown.calls.argsFor(0)[0];
		initArgs.onChange('one,another');
		expect(component.onTouchedCallback).toHaveBeenCalledWith();
	});

	it('sets a value when dropdown changes its value', () => {
		let initArgs = jQueryInstance.dropdown.calls.argsFor(0)[0];
		initArgs.onChange('one,another');
		expect(component.value).toEqual(['one', 'another']);
	});
});
