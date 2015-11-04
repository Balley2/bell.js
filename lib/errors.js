/**
 * @overview  Bell errors dispatcher.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const ssdb = require('ssdb');
const Sequelize = require('sequelize');
const log = require('./log');

var fatals = [
  ssdb.ConnectionError,
  ssdb.TimeoutError,
  Sequelize.ConnectionError,
];

var skips = [
  ssdb.SSDBError,
  Sequelize.ValidationError,
  Sequelize.TimeoutError,
  Sequelize.DatabaseError,
];

exports.dispatch = function(err) {
  if (!err)
    return;
  var i;

  for (i = 0; i < fatals.length; i++) {
    if (err instanceof fatals[i]) {
      log.error(err.stack);
      process.exit(1);
      return;
    }
  }

  for (i = 0; i < skips.length; i++) {
    if (err instanceof skips[i]) {
      log.error(err.stack);
      return;
    }
  }

  throw err;
};
