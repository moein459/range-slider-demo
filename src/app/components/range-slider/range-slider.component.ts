import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, delay, map, pairwise} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject, Subscription} from 'rxjs';

@Component({
	selector: 'app-range-slider',
	templateUrl: './range-slider.component.html',
	animations: [
		trigger('sliderValueVisibility', [
			state('hidden', style({opacity: 0, top: '-35px'})),
			state('visible', style({opacity: 1, top: '-85px'})),
			transition('* <=> *', animate('.2s ease-in-out'))
		])
	]
})
export class RangeSliderComponent implements OnInit, OnDestroy {
	@Input()
	id: string;

	@Input()
	min = 20;

	@Input()
	max = 150;

	@Input()
	default = 70;

	@Input()
	delay = 50;

	formControl = new FormControl([this.default]);

	focused = false;
	directionState: 'right' | 'left' | 'unset';

	private offset$ = new BehaviorSubject<string>(this.calculateOffset());
	offset = this.offset$.asObservable().pipe(delay(this.delay));

	sub = new Subscription();

	constructor() {
	}

	get value() {
		return this.formControl.value;
	}

	get percentageValue() {
		const range = this.max - this.min;
		return Math.floor((this.value - this.min) * 100 / range);
	}

	get bgGradient() {
		return `linear-gradient(90deg, #4834D4 ${this.percentageValue}%, #D2E2FF 0)`;
	}

	ngOnInit() {
		const sub1 = this.formControl.valueChanges
			.pipe(debounceTime(this.delay))
			.subscribe(() => {
				this.directionState = 'unset';
			});

		const sub2 = this.formControl.valueChanges
			.pipe(
				pairwise(),
				map(([prev, curr]) => curr > prev ? 'right' : 'left'))
			.subscribe(value => {
				this.directionState = value;
				this.offset$.next(this.calculateOffset());
			});

		this.sub.add(sub1);
		this.sub.add(sub2);
	}

	calculateOffset() {
		const offset = Math.floor(34 * (this.percentageValue / 100));
		return `calc(${this.percentageValue}% - ${offset}px)`;
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
