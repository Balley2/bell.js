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
exports.startSyncTrendings = startSyncTrendings;
exports.startSyncProjects = startSyncProjects;
exports.startSyncReceivers = startSyncReceivers;

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
  var i, project;
  var dict = {};

  for (i = 0; i < projects.length; i++) {
    project = projects[i];
    project.rules = project.getRules();
    project.receivers = project.getReceivers();
    dict[project.name] = project;
  }

  ctx.projects = dict;
  log.info("sync projects done, %d items", projects.length);
}

/**
 * Sync recievers from sqlite.
 */
function *syncReceivers() {
  yield sequelize.sync();
  var receivers = yield models.Receiver.findAll();
  var i, receiver;
  var dict = {};

  for (i = 0; i < receivers.length; i++) {
    receiver = receivers[i];
    receiver.projects = receiver.getProjects();
    dict[receiver.name] = receiver;
  }
  ctx.receivers = dict;
  log.info("sync receivers done, %d items", receivers.length);
}

//------------------------------------------
// Start jobs.
//------------------------------------------
/**
 * Start `syncTrendings`.
 * @param {Number} milliSeconds
 */
function startSyncTrendings(milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncTrendings();
  }), milliSeconds || 1000*config.interval);
}

/**
 * Start `syncProjects`.
 * @param {Number} milliSeconds
 */
function startSyncProjects(milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncProjects();
  }), milliSeconds || consts.syncIntervalDefault);
}

/**
 * Start `syncReceivers`.
 * @param {Number} milliSeconds
 */
function startSyncReceivers(milliSeconds) {
  util.setIntervalAndRunNow(co.wrap(function *() {
    yield syncReceivers();
  }), milliSeconds || consts.syncIntervalDefault);
}
