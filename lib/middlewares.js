/**
 * @overview  Webapp koa middlewares.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const auth = require('koa-basic-auth');
const parser = require('koa-bodyparser');
const mount = require('koa-mount');
const session = require('koa-session');
const static_ = require('koa-static');
const config = require('./config');
const consts = require('./consts');
const log = require('./log');
const render = require('./render');
const url = require('./url');

//------------------------------------------
// Exports
//------------------------------------------
exports.register = function(webapp) {
  var app = webapp.app;
  app.keys = [consts.sessionSecret];
  app.use(session(app));
  app.use(parser());
  app.use(flash);
  app.use(flashUtil);
  app.use(logger);
  app.use(renderer);
  app.use(mount(url('/static'), static_(consts.staticPath)));
  app.use(error401);
  app.use(mount('/admin', auth(config.webapp.auth)));
};

//------------------------------------------
// Koa middlewares
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

/**
 * Renderer inside koa context.
 */
function *renderer(next) {
  var ctx = this;
  this.render = function(template, context) {
    context = context || {};
    context.ctx = context.ctx || ctx;
    return render(template, context);
  };
  yield next;
}

/**
 * Message flashing via session.
 */
function *flash(next) {
  var ctx = this;
  var fls = this.session.fls = this.session.fls || [];
  this.flash = function(data) {
    ctx.session.fls.push(data);
  };
  this.getFlashes = function() {
    delete ctx.session.fls;
    return fls;
  };
  yield next;
  if (this.status == 302 && this.session && !this.session.fls)
    this.sessions.fls = fls;
}

/**
 * Flash util functions.
 */
function *flashUtil(next) {
  var ctx = this;
  this.flash.ok = function(msg) {
    ctx.flash({msg: msg, className: 'success'});
  };
  this.flash.warn = function(msg) {
    ctx.flash({msg: msg, className: 'warning'});
  };
  this.flash.error = function(msg) {
    ctx.flash({msg: msg, className: 'danger'});
  };
  yield next;
}
