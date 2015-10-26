/**
 * @overview  Project controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('project', function(self, handlers, util) {
  var formCreate = $('#form-create');
  var modalCreate = $('#modal-create');
  var errorCreate = $('#error-create');
  /**
   * Entry.
   */
  self.init = function() {
    self.initCreate();
  };
  /**
   * Init create-project.
   */
  self.initCreate = function() {
    $(formCreate).submit(self.create);
    $(modalCreate).on('hidden.bs.modal', function(e) {
      $(errorCreate).html('');
    });
  };
  /**
   * Create project.
   */
  self.create = function(event) {
    event.preventDefault();
    var form = this;
    var data = util.collectForm(form);
    handlers.project.create(data.name, function(err, data) {
      if (err) {
        handlers.error.error(err, errorCreate);
        return;
      }
      $(modalCreate).modal('hide');
    });
  };
});
