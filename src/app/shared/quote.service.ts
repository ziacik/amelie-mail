import { Injectable } from '@angular/core';
import * as cheerio from 'cheerio';
import * as css from 'css';

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
				body = $('body').html();

				if (body === null) {
					body = mail.body;
				}

				let styleElements = $('head').find('style');
				styles = this.adjustStyles($, styleElements);
			}
		}

		return '<blockquote>' + styles + body + '</blockquote>';
	}

	private adjustStyles($, styleElements) {
		return styleElements.map((i, styleElement) => {
			let $styleElement = $(styleElement);
			let adjusted = this.tryAdjustStyles($styleElement.text());
			$styleElement.text(adjusted);
			return $styleElement;
		}).get().join('');
	}

	private tryAdjustStyles(styleStr) {
		try {
			let parsed = css.parse(styleStr);
			this.adjustNodes(parsed.stylesheet.rules);
			return css.stringify(parsed);
		} catch (err) {
			console.error('Unable to parse mail styles.', err);
			return '';
		}
	}

	private adjustNodes(nodes: any[]) {
		if (!nodes) {
			return;
		}

		nodes.forEach(node => {
			if (node.type === 'rule') {
				this.adjustRule(node as css.Rule);
			} else {
				this.adjustNodes(node.rules);
			}
		});
	}

	private adjustRule(rule: css.Rule) {
		if (!rule.selectors) {
			return;
		}

		rule.selectors = rule.selectors.map(selector => {
			return '#mail-editor ' + selector;
		});
	}
}
