/**
 * @overview  Project handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('project', function(self, util) {
  /**
   * Create project
   * @param {String} name
   * @param {Function} cb // function(err, data)
   */
  self.create = function(name, cb) {
    return util.post(util.url('/api/admin/project'), {name: name}, cb);
  };
  /**
   * Get all projects
   * @param {Function} cb // function(err, data)
   */
  self.getAll = function(cb) {
    return util.get(util.url('/api/projects'), cb);
  };
  /**
   * Delete project by id
   * @param {Number} id
   * @param {Function} cb // function(err)
   */
  self.delete = function(id, cb) {
    return util.delete(util.url('/api/admin/project/' + id), cb);
  };
  /**
   * Get project by id
   * @param {Number} id
   * @param {Function} cb // function(err, data)
   */
  self.get = function(id, cb) {
    return util.get(util.url('/api/project/' + id), cb);
  };
  /**
   * Patch project by id
   * @param {Number} id
   * @param {String} name
   * @param {Function} cb
   */
  self.patch = function(id, name, cb) {
    return util.patch(util.url('/api/admin/project/' + id), {name: name}, cb);
  };
});
