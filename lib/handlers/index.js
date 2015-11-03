/**
 * @overview  API Handlers.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const config = require('./config');
const errors = require('./errors');
const metric = require('./metric');
const project = require('./project');
const receiver = require('./receiver');
const rule = require('./rule');

//------------------------------------------
// Register all handlers to service.
//------------------------------------------
exports.register = function(service) {
  errors.register(service);
  config.register(service);
  metric.register(service);
  project.register(service);
  receiver.register(service);
  rule.register(service);
};
