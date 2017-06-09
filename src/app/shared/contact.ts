export class Contact {
	private _address: string;
	private _name: string;

	constructor(address: string, name: string = null) {
		this._address = address;
		this._name = name;
	}

	get address(): string {
		return this._address;
	}

	get name(): string {
		return this._name;
	}
}
