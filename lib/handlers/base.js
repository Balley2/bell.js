/**
 * @overview  Base handlers.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const auth = require('koa-basic-auth');
const parser = require('koa-bodyparser');
const mount = require('koa-mount');
const serve = require('koa-static');
const config = require('../config');
const log = require('../log');
const util = require('../util');

exports.register = function(service) {
  var app = service.app;
  var path = util.join(__dirname, '...', 'web');
  app.use(parser());
  app.use(logger);
  app.use(error401);
  app.use(mount('/admin', auth(config.webapp.auth)));
  app.use(mount('/api/admin', auth(config.webapp.auth)));
  app.use(mount('/public', serve(path)));
};

//------------------------------------------
// Custom koa middlewares
//------------------------------------------
/**
 * 401 handler (for basic-auth)
 */
function *error401(next) {
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'Unauthorized';
    } else {
      throw err;
    }
  }
}

/**
 * Simple request logger.
 */
function *logger(next) {
  var startAt = new Date();
  var ctx = this;
  var done = function() {
    var elapsed = new Date() - startAt;
    log.info("%sms %s %s %s", elapsed, ctx.status, ctx.method,
             ctx.originalUrl);
  };
  ctx.res.once('finish', done);
  ctx.res.once('close', done);
  yield next;
}
