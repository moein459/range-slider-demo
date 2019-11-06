import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BehaviorSubject, Subject, Subscription, interval} from 'rxjs';
import {debounceTime, delay, map, pairwise, startWith, takeUntil, takeWhile} from 'rxjs/operators';

enum DirectionState {
	Unset,
	Right,
	Left
}

@Component({
	selector: 'app-range-slider',
	templateUrl: './range-slider.component.html',
})
export class RangeSliderComponent implements OnInit, OnDestroy {
	@Input()
	id: string;

	@Input()
	min = 0;

	@Input()
	max = 100;

	@Input()
	default = 70;

	@Input()
	delay = 75;

	formControl = new FormControl([this.default]);

	focused = false;

	directionState$ = new BehaviorSubject<DirectionState>(DirectionState.Unset);
	directionChange$ = new Subject();

	offset$ = new BehaviorSubject<string>(this.calculateOffset());
	offset = this.offset$.asObservable().pipe(delay(this.delay));

	degreeAmount = 0;

	sub = new Subscription();

	get value() {
		return this.formControl.value;
	}

	get percentageValue() {
		const range = this.max - this.min;
		return Math.floor((this.value - this.min) * 100 / range);
	}

	get directionState() {
		return this.directionState$.getValue();
	}

	get isMoving() {
		return this.focused && this.directionState !== DirectionState.Unset;
	}

	get scale() {
		const scale = Math.floor(this.percentageValue / 3) / 100;
		return scale ? (scale + '').split('.')[1] : 0;
	}

	get degree() {
		return Math.floor(this.degreeAmount * 2.5);
	}

	get bgGradient() {
		return `linear-gradient(90deg, #4834D4 ${this.percentageValue}%, #D2E2FF 0)`;
	}

	get balloonTransformation() {
		return `scale(1.${this.scale}) rotate(${this.degree}deg)`;
	}

	ngOnInit() {
		const sub1 = this.formControl.valueChanges
			.pipe(debounceTime(50))
			.subscribe(() => {
			this.directionState$.next(DirectionState.Unset);
		});

		const sub2 = this.formControl.valueChanges
			.pipe(
				startWith(this.default),
				pairwise(),
				map(([curr, prev]) => curr > prev ? DirectionState.Left : DirectionState.Right))
			.subscribe((value) => {
				if (this.directionState !== value) {
					this.directionChange$.next(value);
					this.degreeAmount = 0;
				}
				this.increaseBalloonDegree();
				this.directionState$.next(value);
				this.offset$.next(this.calculateOffset());
			});

		this.sub.add(sub1);
		this.sub.add(sub2);
	}

	calculateOffset() {
		const offset = Math.floor(18 * (this.percentageValue / 100));
		return `calc(${this.percentageValue}% - ${offset}px)`;
	}

	mouseDown() {
		this.focused = true;
	}

	mouseUp() {
		this.directionState$.next(DirectionState.Unset);
		this.focused = false;
	}

	increaseBalloonDegree() {
		this.degreeAmount += this.directionState === DirectionState.Right ? -1 : 1;
		this.decreaseBalloonDegree();
	}

	decreaseBalloonDegree() {
		const sub = interval(this.delay)
			.pipe(
				delay(this.delay),
				takeUntil(this.directionChange$),
				takeWhile(() => this.degreeAmount !== 0))
			.subscribe(() => {
				if (this.degreeAmount < 1 || this.degreeAmount > -1) { sub.unsubscribe(); }
				this.degreeAmount += this.degreeAmount >= 1 ? -1 : 1;
			});
	}

	ngOnDestroy(): void {
		this.sub.unsubscribe();
	}
}
