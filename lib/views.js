/**
 * @overview  Bell webapp views.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */
// jshint -W124

'use strict';

const clone = require('clone');
const route = require('koa-route');
const render = require('./render');
const url = require('./url');
const util = require('./util');

//------------------------------------------
// Register views to service.
//------------------------------------------
exports.register = function(service) {
  service.app.use(route.get(url('/'), index));
};

//------------------------------------------
// Util functions
//------------------------------------------
/**
 * Normalize params from koa query.
 * @param {Object} query // ctx.request.query
 * @return {Object}
 */
function normalizeParams(query) {
  query = query || {};
  var params = {
    type: query.type || 'm',
    limit: +query.limit || 50,
    sort: query.sort || 'up',
    past: query.past || '0s',
    stop: +query.stop || 0,
  };
  if (!query.project) {
    params.pattern = query.pattern || '*';
  } else {
    params.project = query.project;
  }
  return params;
}

/**
 * Switch params with key-value pairs.
 * @param {Object} params // params
 * @param {Object} pairs // {paramName: paramNewValue}
 * @return {String}
 */
function switchParams(params, pairs) {
  var defaults = normalizeParams();
  var newParams = util._extend(clone(params), pairs);
  return util.cleanWith(newParams, defaults);
}

//------------------------------------------
// View handlers
//------------------------------------------
function *index() {
  this.body = yield render('index.html', {
    params: normalizeParams(this.request.query),
    switchParams: switchParams,
  });
}
