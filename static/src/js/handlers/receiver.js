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
  /**
   * Add receiver to project.
   * @param {Number} id
   * @param {Object} data
   * @param {Function} cb
   */
  self.add = function(id, data, cb) {
    return util.post(util.url('/api/admin/project/' + id + '/receiver'), data, cb);
  };
  /**
   * Remove receiver from project.
   * @param {Number} projectId
   * @param {Number} receiverId
   * @param {Function} cb
   */
  self.remove = function(projectId, receiverId, cb) {
    return util.del(util.url('/api/admin/project/' + projectId + '/receiver/' + receiverId), cb);
  };
  /**
   * Get receiver by id.
   * @param {Number} id
   * @param {Function} cb
   */
  self.get = function(id, cb) {
    return util.get(util.url('/api/admin/receiver/' + id), cb);
  };
  /**
   * Patch receiver.
   * @param {Number} id
   * @param {Object} data
   * @param {Function} cb
   */
  self.patch = function(id, data, cb) {
    return util.patch(util.url('/api/admin/receiver/' + id), data, cb);
  };
  /**
   * Get projects by receiver id.
   * @param {Number} id
   * @param {Function} cb
   */
  self.getProjects = function(id, cb) {
    return util.get(util.url('/api/admin/receiver/' + id + '/projects'), cb);
  };
  /**
   * Delete receiver by id.
   * @param {Number} id
   * @param {Function} cb
   */
  self.del = function(id, cb) {
    return util.del(util.url('/api/admin/receiver/' + id), cb);
  };
});
