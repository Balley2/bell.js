/**
 * @overview  Webapp cron jobs.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

const co = require('co');
const config = require('./config');
const consts = require('./consts');
const log = require('./log');
const models = require('./models');
const util = require('./util');

var ssdb;
var sequelize;
var ctx = {};

//------------------------------------------
// Exports
//------------------------------------------
exports.register = function(webapp) {
  ssdb = webapp.ssdb;
  sequelize = webapp.sequelize;

};
exports.ctx = ctx;
exports.syncTrendings = syncTrendings;
exports.syncDashboards = syncDashboards;
exports.startSyncTrendings = startSyncTrendings;
exports.startSyncDashboards = startSyncDashboards;

//------------------------------------------
// Cron jobs
//------------------------------------------
/**
 * Sync trendings from ssdb.
 */
function *syncTrendings() {
  var hash = config.ssdb.prefix + 'trend';
  var list = yield ssdb.acquire().hgetall(hash);
  var dict = {}, i;

  for (i = 0; i < list.length; i += 2) {
    dict[list[i]] = list[i + 1];
  }

  ctx.trendings = dict;
  log.info("sync trendings done, %d items", util.objectLength(ctx.trendings));
}

/**
 * Sync dashboards from sqlite.
 */
function *syncDashboards() {
  yield sequelize.sync();
  ctx.dashboards = yield models.Dashboard.findAll();
  ctx.dashboardMap = {};
  var i, dashboard;

  for (i = 0; i < ctx.dashboards.length; i++) {
    dashboard = ctx.dashboards[i];
    dashboard.patterns = dashboard.patterns.split('\n');
    ctx.dashboardMap[dashboard.id] = dashboard;
  }

  ctx.dashboards.sort(function(a, b) {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  });
  log.info("sync dashboards done, %d items", ctx.dashboards.length);
}

//------------------------------------------
// Start jobs.
//------------------------------------------
function startSyncTrendings() {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncTrendings();
  }), 1000*config.interval);
}

function startSyncDashboards() {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncDashboards();
  }), consts.cronInterval);
}
