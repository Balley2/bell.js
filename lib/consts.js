/**
 * @overview  Constants.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const util = require('./util');

exports.syncIntervalDefault = 10 * 1000;

exports.publicDir = util.join(__dirname, '..', 'web');
exports.templateDir = util.join(exports.publicDir, 'html');
exports.templateIndexPath = util.join(exports.templateDir, 'index.html');
