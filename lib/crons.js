/**
 * @overview  Service cron job.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

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
// Register crons to service.
//------------------------------------------
exports.register = function(service) {
  ssdb = service.ssdb;
  sequelize = service.sequelize;

};
exports.ctx = ctx;
exports.syncTrendings = syncTrendings;
exports.syncProjects = syncProjects;
exports.syncReceivers = syncReceivers;
exports.syncRules = syncRules;
exports.startSyncTrendings = startSyncTrendings;
exports.startSyncProjects = startSyncProjects;
exports.startSyncReceivers = startSyncReceivers;
exports.startSyncRules = startSyncRules;

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
  log.info("sync trendings done, %d items", util.objectLength(dict));
  return ctx.trendings;
}

/**
 * Sync projects from sqlite.
 */
function *syncProjects() {
  yield sequelize.sync();
  var projects = yield models.Project.findAll();
  var i, project, receivers, universals;

  for (i = 0; i < projects.length; i++) {
    project = projects[i];
    project.rules = yield project.getRules();
    receivers = yield project.getReceivers();
    universals = yield models.Receiver.findAll({where: {universal: true}});
    [].unshift.apply(receivers, universals);
    project.receivers = receivers;
  }

  ctx.projects = projects;
  log.info("sync projects done, %d items", projects.length);
}

/**
 * Sync recievers from sqlite.
 */
function *syncReceivers() {
  yield sequelize.sync();
  var receivers = yield models.Receiver.findAll();
  var i, receiver;

  for (i = 0; i < receivers.length; i++) {
    receiver = receivers[i];
    receiver.projects = receiver.getProjects();
  }
  ctx.receivers = receivers;
  log.info("sync receivers done, %d items", receivers.length);
}

/**
 * Sync rules from sqlite.
 */
function *syncRules() {
  yield sequelize.sync();
  ctx.rules = yield models.Rules.findAll();
  log.info("sync rules done, %d items", ctx.rules.length);
}

//------------------------------------------
// Start jobs.
//------------------------------------------
/**
 * Start `syncTrendings`.
 * @param {Number} milliSeconds
 * @param {Function} cb
 */
function startSyncTrendings(milliSeconds, cb) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncTrendings();
    if (cb) cb();
  }), milliSeconds || 1000*config.interval);
}

/**
 * Start `syncProjects`.
 * @param {Number} milliSeconds
 * @param {Function} cb
 */
function startSyncProjects(milliSeconds, cb) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncProjects();
    if (cb) cb();
  }), milliSeconds || consts.syncIntervalDefault);
}

/**
 * Start `syncReceivers`.
 * @param {Number} milliSeconds
 * @param {Function} cb
 */
function startSyncReceivers(milliSeconds, cb) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncReceivers();
    if (cb) cb();
  }), milliSeconds || consts.syncIntervalDefault);
}

/**
 * Start `syncRules`.
 * @param {Number} milliSeconds
 * @param {Function} cb
 */
function startSyncRules(milliSeconds, cb) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncRules();
    if (cb) cb();
  }), milliSeconds || consts.syncIntervalDefault);
}
