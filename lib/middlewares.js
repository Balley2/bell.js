/**
 * @overview  Koa middlewares.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const log = require('./log');
const render = require('./render');

module.exports = {
  /**
   * 401 handler (for basic-auth)
   */
  error401: function *(next) {
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
  },
  /**
   * Simple request logger.
   */
  log: function *(next) {
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
  },
  /**
   * Render with ctx.
   */
  render: function *(next) {
    var ctx = this;
    this.render = function(template, context) {
      context.ctx = context.ctx || ctx;
      return render(template, context);
    };
    yield next;
  },
  /**
   * Util functions to work with flash.
   */
  flashUtil: function *(next) {
    var ctx = this;
    this.flash.ok = function(msg) {
      ctx.flash.msg = msg;
      ctx.flash.className = 'success';
    };
    this.flash.warn = function(msg) {
      ctx.flash.msg = msg;
      ctx.flash.className = 'warning';
    };
    this.flash.error = function(msg) {
      ctx.flash.msg = msg;
      ctx.flash.className = 'danger';
    };
    yield next;
  },
};
