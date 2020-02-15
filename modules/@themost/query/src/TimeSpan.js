/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
/**
 * @class
 */
export class TimeSpan {
    /**
     *
     * @param {number=} years
     * @param {number=}  months
     * @param {number=} days
     * @param {number=} hours
     * @param {number=} minutes
     * @param {number=} seconds
     */
    constructor(years, months, days, hours, minutes, seconds) {
        this.years = years;
        this.months = months;
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }
    toString() {

    }
}
