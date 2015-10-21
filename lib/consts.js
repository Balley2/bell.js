/**
 * @overview  Bell consts.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const crypto = require('crypto');
const util = require('./util');

const viewPath = util.join(__dirname, '..', 'view');
const staticPath = util.join(__dirname, '..', 'static');
const sessionSecret = crypto.randomBytes(64).toString('hex');
const cronInterval = 1000*10; // ms

module.exports = {
  viewPath: viewPath,
  staticPath: staticPath,
  sessionSecret: sessionSecret,
  cronInterval: cronInterval,
};
