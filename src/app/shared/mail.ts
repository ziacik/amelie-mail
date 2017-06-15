import { Recipient } from './recipient';
import { Contact } from './contact';

export class Mail {
	private _uid: string;
	private _messageId: string;
	private _from: Contact;
	private _recipients: Recipient[];
	private _subject: string;
	private _body: string;
	private _bodyType: string;
	private _date: Date;
	private _attachments: any[];
	private _isSeen: boolean;

	constructor(from: Contact, recipients: Recipient[], subject: string, body: string, date: Date = undefined, bodyType: string = 'text/html', uid: string = null, messageId: string = null, attachments: any[] = [], isSeen: boolean = false) {
		this._from = from;
		this._recipients = recipients;
		this._subject = subject;
		this._body = body;
		this._date = date || new Date();
		this._bodyType = bodyType;
		this._uid = uid;
		this._messageId = messageId;
		this._attachments = attachments;
		this._isSeen = isSeen;
	}

	public get uid(): string {
		return this._uid;
	}

	public get messageId(): string {
		return this._messageId;
	}

	public get from(): Contact {
		return this._from;
	}

	public get recipients(): Recipient[] {
		return this._recipients.slice();
	}

	public get subject(): string {
		return this._subject;
	}

	public get body(): string {
		return this._body;
	}

	public get bodyType(): string {
		return this._bodyType;
	}

	public get date(): Date {
		return this._date;
	}

	public get attachments(): any[] {
		return this._attachments.slice();
	}

	public get isSeen(): boolean {
		return this._isSeen;
	}

	public markSeen() {
		this._isSeen = true;
	}

	public markUnseen() {
		this._isSeen = false;
	}

	// FIXME
	public get plainBody(): string {
		return this._body;
	}
}
