/**
 * @overview  Rule handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('rule', function(self, util) {
  /**
   * Add rule to project.
   * @param {Number} projectId
   * @param {Object} data
   * @param {Function} cb // function(err, data)
   */
  self.add = function(projectId, data, cb) {
    return util.post(util.url('/api/admin/project/' + projectId + '/rule'),
                     data, cb);
  };
  /**
   * Get rules by project id.
   * @param {Number} projectId
   * @param {Function} cb // function(err, data)
   */
  self.gets = function(projectId, cb) {
    return util.get(util.url('/api/admin/project/' + projectId + '/rules'), cb);
  };
  /**
   * Delete rules by id.
   * @param {Number} id
   * @param {Function} cb // function(err, data)
   */
  self.del = function(id, cb) {
    return util.del(util.url('/api/admin/rule/' + id), cb);
  };
});
