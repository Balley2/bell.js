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
  var timer = util.timerStart();
  var hash = config.ssdb.prefix + 'trend';
  var list = yield ssdb.acquire().hgetall(hash);
  var dict = {}, i;

  for (i = 0; i < list.length; i += 2) {
    dict[list[i]] = list[i + 1];
  }

  ctx.trendings = dict;
  log.info("%dms sync trendings done, %d items", timer.elapsed(), util.objectLength(dict));
  return ctx.trendings;
}

/**
 * Sync projects from sqlite.
 */
function *syncProjects() {
  var timer = util.timerStart();
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
  log.info("%dms sync projects done, %d items", timer.elapsed(), projects.length);
}

/**
 * Sync recievers from sqlite.
 */
function *syncReceivers() {
  var timer = util.timerStart();
  var receivers = yield models.Receiver.findAll();
  var i, receiver;

  for (i = 0; i < receivers.length; i++) {
    receiver = receivers[i];
    receiver.projects = receiver.getProjects();
  }
  ctx.receivers = receivers;
  log.info("%dms sync receivers done, %d items", timer.elapsed(), receivers.length);
}

/**
 * Sync rules from sqlite.
 */
function *syncRules() {
  var timer = util.timerStart();
  ctx.rules = yield models.Rule.findAll({
    where: {
      ProjectId: {$ne: null}
    }
  });
  log.info("%dms sync rules done, %d items", timer.elapsed(), ctx.rules.length);
}

//------------------------------------------
// Start jobs.
//------------------------------------------
/**
 * Start `syncTrendings`.
 * @param {Function} cb
 * @param {Number} milliSeconds
 */
function startSyncTrendings(cb, milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncTrendings();
    if (cb) cb();
  }), milliSeconds || 1000*config.interval);
}

/**
 * Start `syncProjects`.
 * @param {Function} cb
 * @param {Number} milliSeconds
 */
function startSyncProjects(cb, milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncProjects();
    if (cb) cb();
  }), milliSeconds || consts.syncIntervalDefault);
}

/**
 * Start `syncReceivers`.
 * @param {Function} cb
 * @param {Number} milliSeconds
 */
function startSyncReceivers(cb, milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncReceivers();
    if (cb) cb();
  }), milliSeconds || consts.syncIntervalDefault);
}

/**
 * Start `syncRules`.
 * @param {Function} cb
 * @param {Number} milliSeconds
 */
function startSyncRules(cb, milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncRules();
    if (cb) cb();
  }), milliSeconds || consts.syncIntervalDefault);
}
