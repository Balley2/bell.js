/**
 * @overview  Global app instance.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

(function() {
  this.app = {};
  app.util = {};

  app.handler = function(name, register) {
    app.handlers = app.handlers || {};
    app.handlers[name] = {};
    register(app.handlers[name], app.util);
  };

  app.controller = function(name, register) {
    app.controllers = app.controllers || {};
    app.controllers[name] = {};
    register(app.controllers[name], app.handlers, app.util);
  };
})(this);
