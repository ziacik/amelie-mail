import { Component, ElementRef, AfterViewInit, Input, forwardRef } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ContactService } from '../shared/contact.service';
import { Contact } from '../shared/contact';
import { Recipient } from '../shared/recipient';

@Component({
	selector: 'app-recipient-selector',
	templateUrl: './recipient-selector.component.html',
	styleUrls: ['./recipient-selector.component.css'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => RecipientSelectorComponent),
		multi: true
	}]
})
export class RecipientSelectorComponent implements AfterViewInit, ControlValueAccessor {
	@Input() placeholder: string;
	@Input() id: string;

	private internalValue: Recipient[];

	recipient: FormControl;

	// TODO instead of making contactService public, add a method exposing contacts
	constructor(private elementRef: ElementRef, public contactService: ContactService) {
		this.recipient = new FormControl();
		this.internalValue = [];
	}

	ngAfterViewInit() {
	}

	get value(): Recipient[] {
		return this.internalValue;
	};

	set value(newValues: Recipient[]) {
		this.internalValue = newValues;
		this.onChangeCallback(newValues);
	}

	addRecipient(address: string) {
		let contact = this.contactService.getByAddress(address) || new Contact(address);
		let newRecipient = new Recipient(contact, 'to');
		this.internalValue.push(newRecipient);
	}

	colorFor(recipient: Recipient): string {
		switch (recipient.type) {
			case 'to': return 'primary';
			case 'cc': return 'accent';
		}
	}

	/* ControlValueAccessor stuff */
	private onTouchedCallback: () => void = () => { };
	private onChangeCallback: (_: any) => void = () => { };

	writeValue(value: Recipient[]) {
		this.value = value;
	}

	registerOnChange(fn: any) {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouchedCallback = fn;
	}
}
