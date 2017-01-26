import { Component, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
	selector: 'app-mail-editor',
	templateUrl: './mail-editor.component.html',
	styleUrls: ['./mail-editor.component.css']
})
export class MailEditorComponent implements AfterViewInit, OnDestroy {
	private editor: any;
	private content: string;

	ngAfterViewInit() {
		tinymce.init({
			selector: '#mail-editor',
			theme: 'inlite',
			inline: true,
			theme_url: 'assets/themes/inlite/theme.js',
			skin_url: 'assets/skins/lightgray',
			plugins: ['link', 'paste', 'table'],
			setup: this.setup.bind(this)
		});
	}

	ngOnDestroy() {
		tinymce.remove(this.editor);
	}

	private setup(editor) {
		this.editor = editor;
		editor.on('change', this.change.bind(this));
	}

	private change(e) {
		this.content = this.editor.getContent();
	}
}
