/**
 * @overview  API Handlers.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const config = require('./config');
const metric = require('./metric');

//------------------------------------------
// Register all handlers to service.
//------------------------------------------
exports.register = function(service) {
  config.register(service);
  metric.register(service);
};
