/**
 * @overview  Handler metric.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const minimatch = require('minimatch');
const route = require('koa-route');
const config = require('../config');
const crons = require('../crons');
const errors = require('./errors');
const models = require('../models');
const url = require('../url');
const validators = require('./validators');

var ssdb;

//------------------------------------------
// Register metric handler to service.
//------------------------------------------
exports.register = function(service) {
  ssdb = service.ssdb;
  service.app.use(route.get(url('/api/metric/names'), getNames));
  service.app.use(route.get(url('/api/metric/data'), getData));
};

//------------------------------------------
// Util functions
//------------------------------------------
/**
 * Filter metric names by pattern.
 * @param {String} pattern
 * @return {Array}
 */
function filterTrendings(pattern) {
  return Object.keys(crons.ctx.trendings)
  .filter(minimatch.filter(pattern));
}

/**
 * Get project by id (with rules)
 * @param {Number} id
 * @return {Project}
 * @throws ErrProjectId/ErrProjectNotFound
 */
function *getProjectById(id) {
 id = validators.validateProjectId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw errors.ErrProjectNotFound;
  project.rules = yield project.getRules();
  return project;
}

//------------------------------------------
// Metric API
//------------------------------------------
/**
 * Get current metric names.
 * @api /api/metric/names
 * @method GET
 * @param {Number} limit
 * @param {String} sort
 * @param {Number} project
 * @param {String} pattern
 * @return {Object}
 * @throws ErrProjectNotFound/ErrProjectId
 */
function *getNames() {
  var limit = +this.query.limit || 50;
  var sort = this.query.sort || 'up';
  var projectId = this.query.project;
  var pattern = this.query.pattern || '*';
  var keys = [], project, i, p;

  if (projectId) {
    project = yield getProjectById(+projectId);
    for (i = 0; i < project.rules.length; i++) {
      p = project.rules[i].pattern;
      [].push.apply(keys, filterTrendings(p));
    }
  } else {
    keys = filterTrendings(pattern);
  }

  var trends = {}, times = {};
  var key, val, item;

  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    val = crons.ctx.trendings[key];
    item = val.split(':');
    trends[key] = +item[0];
    times[key] = +item[1];
  }

  // caculate stats
  var total = keys.length, mcount = 0;

  for (i = 0; i < keys.length; i++) {
    if (trends[key] >= 1)
      mcount += 1;
  }

  // sort by `p / ((t + 2) ^ 1.5)`
  // https://github.com/eleme/bell.js/issues/28
  var now = Math.round(+new Date() / 1000),
    desc = sort === 'up' ? 1 : -1;

  keys.sort(function(a, b) {
    var x = trends[a] / Math.pow(2 + now - times[a], 1.5);
    var y = trends[b] / Math.pow(2 + now - times[b], 1.5);
    return desc * (y - x);
  });

  // yield response
  var names = [];
  keys = keys.slice(0, limit);

  for (i = 0; i < keys.length; i++) {
    names.push([keys[i], trends[keys[i]]]);
  }

  this.body = {
    total: total,
    mcount: mcount,
    names: names
  };
}

/**
 * Get metric datapints.
 * @api /api/metric/data
 * @method GET
 * @param {String} name
 * @param {String} type
 * @param {Number} start
 * @param {Number} stop
 * @return {Object}
 * @throws Null
 */
function *getData() {
  var name = this.request.query.name;
  var type = this.request.query.type;
  var start = +this.request.query.start;
  var stop = +this.request.query.stop;

  var zset = config.ssdb.prefix + name;
  var list = yield ssdb.acquire().zkeys(zset, '', start, stop, -1);
  var idx = type === 'v' ? 0 : 1;

  var vals = [], times = [], i, item;

  for (i = 0; i < list.length; i++) {
    item = list[i].split(':');
    vals.push(+item[idx]);
    times.push(+item[2]);
  }

  var trend = +crons.ctx.trendings[name].split(':')[0];
  this.body = {
    name: name,
    times: times,
    vals: vals,
    trend: trend
  };
}
