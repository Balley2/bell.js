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
  service.app.use(route.get(url('/admin'), admin));
  service.app.use(route.get(url('/admin/config'), config));
  service.app.use(route.get(url('/admin/project'), project));
  service.app.use(route.get(url('/admin/project/:id'), projectEdit));
  service.app.use(route.get(url('/admin/receiver'), receiver));
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
/**
 * @view /
 * @template index.html
 */
function *index() {
  this.body = yield render('index.html', {
    params: normalizeParams(this.request.query),
    switchParams: switchParams,
  });
}

/**
 * @view /admin
 * @redirect /admin/project
 */
function *admin() {
  this.redirect(url('/admin/project'));
}

/**
 * @view /admin/config
 * @template admin/config.html
 */
function *config() {
  this.body = yield render('admin/config.html');
}

/**
 * @view /admin/project
 * @template admin/project.html
 */
function *project(name) {
  this.body = yield render('admin/project.html');
}

/**
 * @view /admin/project/:id
 * @template admin/project.edit.html
 */
function *projectEdit(id) {
  this.body = yield render('admin/project.edit.html', {
    id: id
  });
}

/**
 * @view /admin/receiver
 * @template admin/receiver.html
 */
function *receiver(){
  this.body = yield render('admin/receiver.html');
}
