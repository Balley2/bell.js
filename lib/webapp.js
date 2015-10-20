/**
 * @overview  Bell webapp service.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */
// jshint -W124

'use strict';

const co = require('co');
const cluster = require('cluster');
const koa = require('koa');
const config = require('./config');
const log = require('./log');
const models = require('./models');
const service = require('./service');
const views = require('./views');
const util = require('./util');

/**
 * Service analyzer
 */
function WebApp() {
  this.name = 'webapp';
  this.trendings = {};
  this.dashboards = {};
  this.dashboardMap = {};
}
util.inherits(WebApp, service);

/**
 * Serve entry
 */
WebApp.prototype.serve = function *() {
  if (cluster.isMaster) {
    for (var i = 0; i < config.webapp.workers; i++) {
      var worker = cluster.fork();
      log.info("forked worker, pid %d", worker.process.pid);
    }
  } else {
    var self = this;
    this.app = koa();
    this.createSsdbPool();
    this.createSequelize();
    models.register(this.sequelize);
    views.register(this);
    this.app.listen(config.webapp.port);
    util.setIntervalAndRunNow(co.wrap(function *() {
      yield self.syncTrendings();
      yield self.syncDashboards();
    }), 1000*config.interval);
  }
};

WebApp.prototype.syncTrendings = function *() {
  var hash = config.ssdb.prefix + 'trend';
  var list = yield this.ssdb.acquire().hgetall(hash);
  var dict = {}, i;

  for (i = 0; i < list.length; i += 2) {
    dict[list[i]] = list[i + 1];
  }

  this.trendings = dict;
  log.info("trendings sync done, %d items",
           util.objectLength(this.trendings));
};

WebApp.prototype.syncDashboards = function *() {
  yield this.sequelize.sync();
  this.dashboards = yield models.Dashboard.findAll();
  var i, dashboard;
  this.dashboardMap = {};

  for (i = 0; i < this.dashboards.length; i++) {
    dashboard = this.dashboards[i];
    dashboard.patterns = dashboard.patterns.split('\n');
    this.dashboardMap[dashboard.id] = dashboard;
  }

  this.dashboards.sort(function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  log.info("dashboards sync done, %d items", this.dashboards.length);
};

module.exports = new WebApp();
