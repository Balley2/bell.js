/**
 * @overview  Webapp middlewares.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const auth = require('koa-basic-auth');
const parser = require('koa-bodyparser');
const mount = require('koa-mount');
const serve = require('koa-static');
const config = require('./config');
const consts = require('./consts');
const log = require('./log');
const url = require('./url');

//------------------------------------------
// Register middlewares to service
//------------------------------------------
exports.register = function(service) {
  service.app.use(parser());
  service.app.use(logger);
  service.app.use(error401);
  service.app.use(mount(url('/admin'), auth(config.webapp.auth)));
  service.app.use(mount(url('/api/admin'), auth(config.webapp.auth)));
  service.app.use(mount(url('/public'), serve(consts.staticDir)));
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
