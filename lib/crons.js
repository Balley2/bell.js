/**
 * @overview  Service cron job.
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
exports.register = function(service) {
  ssdb = service.ssdb;
  sequelize = service.sequelize;

};
exports.ctx = ctx;
exports.syncTrendings = syncTrendings;
exports.startSyncTrendings = startSyncTrendings;

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
  return ctx.trendings;
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
