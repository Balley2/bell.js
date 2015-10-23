/**
 * @overview  Config handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('config', function(handler, util) {
  /**
   * Get config.
   * @param {Function} cb // function(err, data)
   */
  handler.get = function(cb) {
    return util.get(util.url('/api/config'), cb);
  };
});
