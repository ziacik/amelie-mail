export class Mail {
	public uid: string;
	public messageId: string;
	public from: string[];
	public to: string[];
	public subject: string;
	public body: string;
	public bodyType: string;

	constructor() {
	}

	public withUid(uid: string): Mail {
		this.uid = uid;
		return this;
	}

	public withMessageId(messageId: string): Mail {
		this.messageId = messageId;
		return this;
	}

	public withFrom(from: string[]): Mail {
		this.from = from;
		return this;
	}

	public withTo(to: string[]): Mail {
		this.to = to;
		return this;
	}

	public withSubject(subject: string): Mail {
		this.subject = subject;
		return this;
	}

	public withBody(body: string): Mail {
		this.body = body;
		return this;
	}

	public withBodyType(bodyType: string): Mail {
		this.bodyType = bodyType;
		return this;
	}
}
