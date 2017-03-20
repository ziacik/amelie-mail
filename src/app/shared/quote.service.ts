import { Injectable } from '@angular/core';
import * as cheerio from 'cheerio';

@Injectable()
export class QuoteService {
	constructor() {
	}

	public quote(mail: any) {
		let body = '';
		let styles = '';

		if (mail.body) {
			if (mail.bodyType === 'text/plain') {
				body = mail.body.replace(/\n/g, '<br />');
			} else {
				let $ = cheerio.load(mail.body);
				body = $('body').html() || mail.body;
				styles = $.html($('head').find('style'));
			}
		}

		return '<blockquote>' + styles + body + '</blockquote>';
	}
}
