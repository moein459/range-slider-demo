import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RangeSliderComponent} from './components/range-slider/range-slider.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
	declarations: [
		AppComponent,
		RangeSliderComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
