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
    return util.post(util.url('/api/admin/project/create'), {name: name}, cb);
  };
  /**
   * Get all projects
   * @param {Function} cb // function(err, data)
   */
  self.getAll = function(cb) {
    return util.get(util.url('/api/projects'), cb);
  };
});
