import { Iwe7CoreControlValueAccessor } from 'iwe7-core';
import { FormGroup, FormBuilder, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Component, Injector, forwardRef, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { pad, getDayDiff, DAY_TIMESTAMP, formatDate, MINUTE_TIMESTAMP } from 'iwe7-util';
const NOW = {
    value: 'now',
    defaultText: '现在'
};
@Component({
    selector: 'picker-time',
    templateUrl: 'picker-time.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PickerTimeComponent),
        multi: true
    }],
    styleUrls: ['./picker-time.scss']
})
export class PickerTimeComponent extends Iwe7CoreControlValueAccessor {
    form: FormGroup;
    @Input() dayLen: number = 3;
    @Input() dayArray: string[] = ['今天', '明天', '后天'];
    @Input() dayFormat: string = 'M月D日';

    @Input() minuteStep: number = 10;


    now: Date = new Date();
    get minTime() {
        return new Date(+this.now + this.delay * MINUTE_TIMESTAMP);
    }

    _showNow: boolean = true;
    @Input()
    set showNow(val: any) {
        this._showNow = coerceBooleanProperty(val);
    }
    get showNow() {
        return this._showNow;
    }

    @Input() delay: number = 15;
    @Input() day: any = {
        len: 3,
        filter: ['今日'],
        format: 'M月D日'
    };

    hours: any[] = [];
    days: any[] = [];
    minutes: any[] = [];

    value: number = 0;
    minuteIndex: number = 0;

    cascadeData_: any;

    get nowText() {
        return (this.showNow && this.showNow.text) || NOW.defaultText;
    }
    constructor(fb: FormBuilder, injector: Injector) {
        super(injector);
        this.form = fb.group({
            day: [0, Validators.required],
            hour: [0, Validators.required],
            minute: [0, Validators.required]
        });
        this.form.get('day').valueChanges.subscribe(res => {
            this.hours = res.children;
            this.form.get('hour').setValue(this.hours[0]);
            this.setCyc('setHours', res);
        });
        this.form.get('hour').valueChanges.subscribe(res => {
            this.minutes = res.children;
            this.form.get('minute').setValue(this.minutes[0]);
            this.setCyc('setMinutes', res);
        });
        this.form.valueChanges.subscribe(res => {
            this._onChange(res);
        });
        this.getCyc('ngOnInit').pipe().subscribe(res => {
            this._updateNow();
            const cascadeData = this.cascadeData();
            this.cascadeData_ = cascadeData;
            this.form.get('day').setValue(this.cascadeData_[0]);
        });
    }

    getGays() {
        const days = [];
        const dayDiff = getDayDiff(this.minTime, this.now);
        for (let i = 0; i < this.day.len; i++) {
            const timestamp = +this.minTime + i * DAY_TIMESTAMP;
            days.push({
                value: timestamp,
                text: (this.day.filter && this.day.filter[dayDiff + i]) || formatDate(new Date(timestamp), this.day.format, 'i')
            });
        }
        return days;
    }

    getHours() {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push({
                value: i,
                text: i + '点',
                children: this.getMinutes()
            });
        }
        return hours;
    }

    getMinutes() {
        const minutes = [];
        for (let i = 0; i < 60; i += this.minuteStep) {
            minutes.push({
                value: i,
                text: pad(i) + '分'
            });
        }
        return minutes;
    }

    partHours() {
        const hours = this.getHours();
        const partHours = hours.slice(this.minTime.getHours());
        partHours[0] = Object.assign({}, partHours[0], { children: this.partMinutes() });
        if (this.showNow) {
            partHours.unshift({
                value: NOW.value,
                text: this.nowText,
                children: []
            });
        }
        return partHours;
    }

    partMinutes() {
        const minutes = this.getMinutes();
        const begin = Math.floor(this.minTime.getMinutes() / this.minuteStep);
        return minutes.slice(begin);
    }

    cascadeData() {
        const days = this.getGays();
        const data = days.slice();
        data.forEach((item, index) => {
            item.children = index ? this.getHours() : this.partHours();
        });
        return data;
    }

    private _updateNow() {
        this.now = new Date();
    }

    setTime(value) {
        this.value = value;
    }
}
