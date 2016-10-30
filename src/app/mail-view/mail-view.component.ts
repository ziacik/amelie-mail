import { Component, ElementRef, AfterViewInit } from '@angular/core';

declare global {
	interface JQuery {
		dropdown(...args): JQuery;
	}
}

declare var $: any;

@Component({
  selector: 'app-mail-view',
  templateUrl: './mail-view.component.html',
  styleUrls: ['./mail-view.component.css']
})
export class MailViewComponent implements AfterViewInit {

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
	  let dropdown = this.elementRef.nativeElement.firstChild;
	  console.log(dropdown);
	$(dropdown).embed();
  }

}
