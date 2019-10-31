import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, map, pairwise} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-range-slider',
	templateUrl: './range-slider.component.html',
	animations: [
		trigger('sliderValue', [
			state('hidden', style({opacity: 0, top: '-35px'})),
			state('visible', style({opacity: 1, top: '-85px'})),
			transition('* <=> *', animate('.2s ease-in-out'))
		])
	]
})
export class RangeSliderComponent implements OnInit, OnDestroy {
	@Input()
	min = 0;

	@Input()
	max = 100;

	@Input()
	default = 70;

	formControl = new FormControl([this.default]);

	focused = false;
	directionState: 'right' | 'left' | 'unset';

	sub = new Subscription();

	constructor() {
	}

	get value() {
		return this.formControl.value;
	}

	get bgGradient() {
		return `linear-gradient(90deg, #4834D4 ${this.value}%, #D2E2FF 0)`;
	}

	get offset() {
		const offset = Math.floor(34 * (this.value / 100));
		return `calc(${this.value}% - ${offset}px`;
	}

	ngOnInit() {
		const sub1 = this.formControl.valueChanges
			.pipe(debounceTime(50))
			.subscribe(value => {
				this.directionState = 'unset';
			});

		const sub2 = this.formControl.valueChanges
			.pipe(
				pairwise(),
				map(([prev, curr]) => curr > prev ? 'right' : 'left'))
			.subscribe(value => {
				this.directionState = value;
			});

		this.sub.add(sub1);
		this.sub.add(sub2);
	}

	mouseDown() {
		this.focused = true;
	}

	mouseUp() {
		this.directionState = 'unset';
		this.focused = false;
	}

	ngOnDestroy(): void {
		this.sub.unsubscribe();
	}
}
