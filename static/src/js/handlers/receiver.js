/**
 * @overview  Receiver handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('receiver', function(self, util) {
  /**
   * Create receiver
   * @param {Object} data
   * @param {Function} cb
   */
  self.create = function(data, cb) {
    return util.post(util.url('/api/admin/receiver'), data, cb);
  };
  /**
   * Get all receivers.
   * @param {Function} cb
   */
  self.getAll = function(cb) {
    return util.get(util.url('/api/admin/receivers'), cb);
  };
});
