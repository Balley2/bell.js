/**
 * @overview  Bell webapp views.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */
// jshint -W124

'use strict';

const auth = require('koa-basic-auth');
const parser = require('koa-bodyparser');
const extend = require('extend');
const mount = require('koa-mount');
const route = require('koa-route');
const minimatch = require('minimatch');
const models = require('./models');
const session = require('koa-session');
const static_ = require('koa-static');
const config = require('./config');
const consts = require('./consts');
const crons = require('./crons');
const log = require('./log');
const middlewares = require('./middlewares');
const url = require('./url');
const util = require('./util');

var webapp;

//----------------------------------------------------
// Register views to webapp
//----------------------------------------------------
exports.register = function(wa) {
  webapp = wa;
  var app = webapp.app;
  app.keys = [consts.sessionSecret];
  app.use(session(app));
  app.use(parser());
  app.use(middlewares.flash);
  app.use(middlewares.flashUtil);
  app.use(middlewares.log);
  app.use(middlewares.render);
  app.use(mount(url('/static'), static_(consts.staticPath)));
  app.use(route.get('/', index));
  app.use(route.get('/api/names', apiNames));
  app.use(route.get('/api/datapoints', apiDatapoints));
  app.use(middlewares.error401);
  app.use(mount('/admin', auth(config.webapp.auth)));
  app.use(route.get('/admin', admin));
  app.use(route.get('/admin/dashboards', adminDashboards));
  app.use(route.post('/admin/dashboards', adminCreateDashboard));
};

//----------------------------------------------------
// Util functions
//----------------------------------------------------
function buildParams(request) {
  var params;

  if (request.query.dashboard) {
    params = {dashboard: +request.query.dashboard};
  } else {
    params = {pattern: request.query.pattern || '*'};
  }

  extend(params, {
    type: request.query.type === 'v' ? 'v' : 'm',
    limit: +request.query.limit || 50,
    sort: request.query.sort === '↓' ? '↓' : '↑',
    past: request.query.past || '0s',
    stop: +request.query.stop || 0,
  });

  return params;
}

function filterTrendings(pattern) {
  return Object.keys(crons.ctx.trendings)
  .filter(minimatch.filter(pattern));
}

//----------------------------------------------------
// View Handlers
//----------------------------------------------------

function *index() {
  yield crons.syncDashboards();
  this.body = yield this.render('index.html', {
    params: buildParams(this.request),
  });
}

function *apiNames() {
  // collect data
  var params = buildParams(this.request);
  var keys = [], dashboard, i, p;

  if (params.dashboard) {
    dashboard = crons.ctx.dashboardMap[params.dashboard];
    if (!dashboard)
      return;
    for (i = 0; i < dashboard.patterns.length; i++) {
      p = dashboard.patterns[i];
      [].push.apply(keys, filterTrendings(p));
    }
  } else {
    keys = filterTrendings(params.pattern);
  }

  var trends = {}, times = {},
    key, val, item;

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
    desc = params.sort === '↑' ? 1 : -1;

  keys.sort(function(a, b) {
    var x = trends[a] / Math.pow(2 + now - times[a], 1.5);
    var y = trends[b] / Math.pow(2 + now - times[b], 1.5);
    return desc * (y - x);
  });

  // yield response
  var names = [];
  keys = keys.slice(0, params.limit);

  for (i = 0; i < keys.length; i++) {
    names.push([keys[i], trends[keys[i]]]);
  }

  this.body = yield {
    total: total,
    mcount: mcount,
    names: names
  };
}

function *apiDatapoints() {
  var name = this.request.query.name;
  var type = this.request.query.time;
  var start = +this.request.query.start;
  var stop = +this.request.query.stop;

  var zset = config.ssdb.prefix + name;
  var list = yield webapp.ssdb.acquire().zkeys(zset, '', start, stop, -1);
  var idx = type === 'v' ? 0 : 1;

  var vals = [], times = [], i, item;

  for (i = 0; i < list.length; i++) {
    item = list[i].split(':');
    vals.push(+item[idx]);
    times.push(+item[2]);
  }

  var trend = +crons.ctx.trendings[name].split(':')[0];
  this.body = yield {
    times: times,
    vals: vals,
    trend: trend
  };
}

function *admin() {
  this.redirect('/admin/dashboards');
}

function *adminDashboards() {
  yield crons.syncDashboards();
  this.body = yield this.render('admin/dashboards.html');
}

function *adminCreateDashboard() {
  var params = this.request.body, dashboard;

  if (params.name.length == 0) {
    this.flash.error("invalid dashboard name");
  } else if (params.patterns.length == 0) {
    this.flash.error("invalid dashboard patterns");
  } else {
    dashboard = yield models.Dashboard.create({
      name: params.name,
      patterns: params.patterns
    });
    if (dashboard) {
      this.flash.ok("dashboard created");
    } else {
      this.flash.ok("failed to create dashboard");
    }
  }
  this.redirect('/admin/dashboards');
}
