import { ViewChild, ElementRef, ViewEncapsulation, Component, AfterViewInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const MAIL_EDITOR_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => MailEditorComponent),
	multi: true
};

const noop = () => {
};

@Component({
	encapsulation: ViewEncapsulation.Native,
	selector: 'app-mail-editor',
	templateUrl: './mail-editor.component.html',
	styleUrls: ['./mail-editor.component.css'],
	providers: [MAIL_EDITOR_VALUE_ACCESSOR]
})
export class MailEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
	@ViewChild('editor') editorRef: ElementRef;

	private editor: any;
	private content: string;

	ngAfterViewInit() {
		tinymce.init({
			target: this.editorRef.nativeElement,
			inline: true,
			menubar: false,
			fixed_toolbar_container: '#editor-tools',
			skin_url: 'assets/skins/amelie',
			valid_children : '+blockquote[style]',
			plugins: [
				'autolink lists link image',
				'searchreplace visualchars code fullscreen',
				'media table contextmenu',
				'emoticons template paste textcolor colorpicker textpattern imagetools codesample'],
			toolbar: 'styleselect | bold italic | bullist numlist outdent indent | forecolor backcolor | codesample | code',
			codesample_content_css: 'assets/plugins/codesample/css/prism.css',
			setup: this.setup.bind(this)
		});
	}

	ngOnDestroy() {
		tinymce.remove(this.editor);
	}

	get value(): any {
		return this.content;
	};

	set value(v: any) {
		if (v !== this.content) {
			this.content = v;

			if (this.editor) {
				this.editor.setContent(this.content);
			}

			this.onChangeCallback(this.content);
		}
	}

	private setup(editor) {
		this.editor = editor;
		editor.on('change', this.change.bind(this));
	}

	private change(e) {
		this.content = this.editor.getContent();
		this.onChangeCallback(this.content);
		this.onTouchedCallback(); // TODO this should be on blur probably
	}

	/* ControlValueAccessor stuff */
	private onTouchedCallback: () => void = noop;
	private onChangeCallback: (_: any) => void = noop;

	writeValue(value: any) {
		if (value !== this.value) {
			this.value = value;
		}
	}

	registerOnChange(fn: any) {
		this.onChangeCallback = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouchedCallback = fn;
	}
}
