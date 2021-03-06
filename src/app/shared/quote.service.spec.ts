import { TestBed, inject } from '@angular/core/testing';

import { QuoteService } from './quote.service';

describe('QuoteService', () => {
	let service: QuoteService;
	let mail;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [QuoteService]
		});
		service = TestBed.get(QuoteService);
	});

	function setupMail(withContent: string) {
		mail = {
			body: withContent
		};
	}

	it('should return empty blockquote when there is no body', () => {
		expect(service.quote({})).toEqual('<blockquote></blockquote>');
	});

	it('should convert plain text to blockquote markup, changing newlines to <br>', () => {
		setupMail('Some\nPlain\nText');
		mail.bodyType = 'text/plain';
		let result = service.quote(mail);
		expect(result).toEqual('<blockquote>Some<br />Plain<br />Text</blockquote>');
	});

	it('should not change newlines to <br> in html body', () => {
		setupMail('Some\nHtml');
		mail.bodyType = 'text/html';
		let result = service.quote(mail);
		expect(result).toEqual('<blockquote>Some\nHtml</blockquote>');
	});

	it('should convert simple markup to blockquote', () => {
		setupMail('<p>Some markup</p>');
		let result = service.quote(mail);
		expect(result).toEqual('<blockquote><p>Some markup</p></blockquote>');
	});

	it('should convert full html to blockquote', () => {
		setupMail('<html><head></head><body><p>Some markup</p></body></html>');
		let result = service.quote(mail);
		expect(result).toEqual('<blockquote><p>Some markup</p></blockquote>');
	});

	it('should prefix all styles with #mail-editor and move them from head inside the blockquote', () => {
		setupMail('<html><head><style rel="whatever">@media whatever { .some complicated[@wer=e] #style, .another { what: ever; } }</style><style type="text/css">a { whatever: 12px; }</style></head><body><p>Some markup</p></body></html>');
		let result = service.quote(mail);
		expect(result.replace(/[\n\s]+/g, ' ')).toEqual('<blockquote><style rel="whatever">@media whatever { #mail-editor .some complicated[@wer=e] #style, #mail-editor .another { what: ever; } }</style><style type="text/css">#mail-editor a { whatever: 12px; }</style><p>Some markup</p></blockquote>');
	});

	it('should remove unparsable styles', () => {
		setupMail('<html><head><style rel="whatever">unclosed { color:red; </style><style type="text/css">a { whatever: 12px; }</style></head><body><p>Some markup</p></body></html>');
		let result = service.quote(mail);
		expect(result.replace(/[\n\s]+/g, ' ')).toEqual('<blockquote><style rel="whatever"></style><style type="text/css">#mail-editor a { whatever: 12px; }</style><p>Some markup</p></blockquote>');
	});
});
