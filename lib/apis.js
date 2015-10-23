/**
 * @overview  Bell webapp apis.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */
// jshint -W124

'use strict';

const clone = require('clone');
const minimatch = require('minimatch');
const route = require('koa-route');
const crons = require('./crons');
const config = require('./config');
const url = require('./url');
const util = require('./util');

var ssdb, sequelize;

//------------------------------------------
// Register apis to service.
//------------------------------------------
exports.register = function(service) {
  ssdb = service.ssdb;
  sequelize = service.sequelize;
  service.app.use(route.get(url('/api/config'), getConfig));
  service.app.use(route.get(url('/api/metric/names'), getMetricNames));
  service.app.use(route.get(url('/api/metric/data'), getMetricData));
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

//------------------------------------------
// API handlers
//------------------------------------------

//------------------------------------------
// Global API
//------------------------------------------
// GET /api/config
function *getConfig() {
  var conf = clone(config);
  // shadow secrets
  conf.ssdb.auth = '******';
  conf.webapp.auth = '******';
  delete conf.emitter;
  this.body = conf;
}

//------------------------------------------
// Metric API
//------------------------------------------
// GET /api/metric/names?pattern=*..
function *getMetricNames() {
  var limit = +this.query.limit || 50;
  var sort = this.query.sort || 'up';
  var projectName = this.query.project;
  var pattern = this.query.pattern || '*';
  var keys = [], project, i, p;

  if (projectName) {
    project = crons.ctx.projects[projectName];
    if (!project) {
      this.status = 404;
      this.body = {msg: 'project not found'};
      return;
    }
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

// GET /api/metric/data?name=&type=...
function *getMetricData() {
  var name = this.request.query.name;
  var type = this.request.query.time;
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

//------------------------------------------
// Project API
//------------------------------------------

//------------------------------------------
// Receiver API
//------------------------------------------
