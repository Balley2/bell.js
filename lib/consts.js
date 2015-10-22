/**
 * @overview  Constants.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const util = require('./util');

exports.syncIntervalDefault = 10 * 1000;

exports.viewDir = util.join(__dirname, '..', 'views');
exports.staticDir = util.join(__dirname, '..', 'static');
