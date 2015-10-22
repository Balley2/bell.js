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
const crons = require('./crons');
const log = require('./log');
const middlewares = require('./middlewares');
const models = require('./models');
const service = require('./service');
const util = require('./util');

/**
 * Service analyzer
 */
function WebApp() {}
util.inherits(WebApp, service);

/**
 * Serve entry
 */
WebApp.prototype.serve = function *() {
  var i, worker;
  var self = this;

  if (cluster.isMaster) {
    for (i = 0; i < config.webapp.workers; i++) {
      worker = cluster.fork();
      log.info("forked worker, pid %d", worker.process.pid);
    }
  } else {
    this.app = koa();
    this.createSsdbPool();
    this.createSequelize();
    models.register(this.sequelize);
    crons.register(this);
    middlewares.register(this);
    this.app.listen(config.webapp.port);
    crons.startSyncTrendings();
  }
};

module.exports = new WebApp();
