'use strict';

var _utils = require('../../modules/@themost/common/utils');

var PathUtils = _utils.PathUtils;


describe('Common Tests', function () {
    it('should use path utils', function () {
        console.log(PathUtils.join(process.cwd(), '.'));
    });
}); /**
     * @license
     * MOST Web Framework 2.0 Codename Blueshift
     * Copyright (c) 2017, THEMOST LP All rights reserved
     *
     * Use of this source code is governed by an BSD-3-Clause license that can be
     * found in the LICENSE file at https://themost.io/license
     */