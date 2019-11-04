import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, delay, map, pairwise, startWith} from 'rxjs/operators';
import {BehaviorSubject, interval, Subscription} from 'rxjs';

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
	directionState: 'right' | 'left' | 'unset' = 'unset';

	private offset$ = new BehaviorSubject<string>(this.calculateOffset());
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

	get isMoving() {
		return this.focused && this.directionState !== 'unset';
	}

	get scale() {
		const n = Math.floor(this.percentageValue / 3) / 100;
		return n ? (n + '').split('.')[1] : 0;
	}

	get degree() {
		return Math.round(this.degreeAmount / 10 * 15);
	}

	get bgGradient() {
		return `linear-gradient(90deg, #4834D4 ${this.percentageValue}%, #D2E2FF 0)`;
	}

	get balloonTransformation() {
		return `scale(1.${this.scale}) rotate(${this.degree}deg)`;
	}

	ngOnInit() {
		const sub1 = this.formControl.valueChanges.pipe(debounceTime(50)).subscribe(() => {
			this.directionState = 'unset';
		});

		const sub2 = this.formControl.valueChanges
			.pipe(
				startWith(this.default),
				pairwise(),
				map(([curr, prev]) => curr > prev ? 'left' : 'right'))
			.subscribe((value) => {
				this.directionState = value;
				this.increaseBalloonDegree();
				this.offset$.next(this.calculateOffset());
			});

		this.sub.add(sub1);
		this.sub.add(sub2);
	}

	calculateOffset() {
		const offset = Math.floor(19 * (this.percentageValue / 100));
		return `calc(${this.percentageValue}% - ${offset}px)`;
	}

	mouseDown() {
		this.focused = true;
	}

	mouseUp() {
		this.directionState = 'unset';
		this.focused = false;
	}

	increaseBalloonDegree() {
		this.degreeAmount += this.directionState === 'right' ? -1 : 1;
		this.decreaseBalloonDegree();
	}

	decreaseBalloonDegree() {
		const sub = interval(100).pipe(delay(100)).subscribe(value1 => {
			if (this.isMoving && this.degreeAmount < 1 || this.degreeAmount > -1 || this.directionState == 'unset') {
				sub.unsubscribe();
			}
			this.degreeAmount += this.degreeAmount >= 1 ? -1 : 1;
		});
	}

	ngOnDestroy(): void {
		this.sub.unsubscribe();
	}
}
