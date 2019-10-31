import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RangeSliderComponent} from './components/range-slider/range-slider.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
	declarations: [
		AppComponent,
		RangeSliderComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
