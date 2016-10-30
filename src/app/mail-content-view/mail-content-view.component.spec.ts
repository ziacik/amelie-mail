/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MailContentViewComponent } from './mail-content-view.component';

describe('MailContentViewComponent', () => {
  let component: MailContentViewComponent;
  let fixture: ComponentFixture<MailContentViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailContentViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailContentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
