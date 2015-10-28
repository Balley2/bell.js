/**
 * @overview  Handler config.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */
// jshint -W124

'use strict';

const clone = require('clone');
const route = require('koa-route');
const config = require('../config');
const url = require('../url');

//------------------------------------------
// Register config handler to service.
//------------------------------------------
exports.register = function(service) {
  service.app.use(route.get(url('/api/admin/config'), get));
};

/*
 * Get config.
 *
 * GET /api/config
 */
function *get() {
  var conf = clone(config);
  // shadow secrets
  conf.ssdb.auth = '******';
  conf.webapp.auth = '******';
  delete conf.emitter;
  this.body = conf;
}
