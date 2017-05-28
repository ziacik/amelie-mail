import { Component, ElementRef, AfterViewInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ContactService } from '../shared/contact.service';

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

	recipients: any;

	private dropdown: any;
	private internalValue: string[];

	constructor(private elementRef: ElementRef, private contactService: ContactService) {
	}

	ngAfterViewInit() {
	}

	get value(): string[] {
		return this.internalValue;
	};

	set value(newValues: string[]) {
		if (this.areValuesDifferent(newValues)) {
			this.internalValue = newValues;

			if (this.dropdown) {
				this.dropdown.dropdown('set exactly', newValues);
			}

			this.onChangeCallback(newValues);
		}
	}

	private areValuesDifferent(otherValue) {
		if (this.internalValue === otherValue) {
			return false;
		}

		if (!this.internalValue || !otherValue) {
			return true;
		}

		if (this.internalValue.length != otherValue.length) {
			return true;
		}

		for (var i = 0; i < otherValue.length; ++i) {
			if (this.internalValue[i] !== otherValue[i]) {
				return true;
			}
		}

		return false;
	}

	private change(value) {
		this.internalValue = value.split(',');
		this.onChangeCallback(this.internalValue);
		this.onTouchedCallback(); // TODO this should be on blur probably
	}

	/* ControlValueAccessor stuff */
	private onTouchedCallback: () => void = () => { };
	private onChangeCallback: (_: any) => void = () => { };

	writeValue(value: any) {
		this.value = value;
	}

	registerOnChange(fn: any) {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouchedCallback = fn;
	}
}
