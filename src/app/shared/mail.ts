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
	private _preview: string;
	private _date: Date;
	private _attachments: any[];
	private _isSeen: boolean;

	constructor(from: Contact, recipients: Recipient[], contents: any, flags: any = {}, metaData: any = {}) {
		this._from = from;
		this._recipients = recipients;
		this._subject = contents.subject;
		this._body = contents.body;
		this._preview = contents.preview;
		this._bodyType = metaData.bodyType;
		this._date = metaData.date;
		this._uid = metaData.uid;
		this._messageId = metaData.messageId;
		this._attachments = contents.attachments;
		this._isSeen = flags.isSeen;
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

	public get preview(): string {
		return this._preview;
	}

	public get isSeen(): boolean {
		return this._isSeen;
	}

	public markSeen() {
		this._isSeen = true;
	}

	public unmarkSeen() {
		this._isSeen = false;
	}
}
