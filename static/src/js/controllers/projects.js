/**
 * @overview  Project controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('projects', function(self, handlers, util) {
  var formCreate = '#form-create';
  var modalCreate = '#modal-create';
  var errorCreate = '#error-create';
  var tableProjects = '#table-projects';
  var templateProjectNode = '#template-project-node';
  var hrefDelete = '.href-delete';
  /**
   * Entry.
   */
  self.init = function() {
    self.initCreate();
    self.list();
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
      handlers.error.ok('project created');
      $(tableProjects).html('');
      self.list();
    });
  };
  /**
   * List projects.
   * @param {Function}
   */
  self.list = function(cb) {
    handlers.project.getAll(function(err, data) {
      var i, project, node, template;
      template = $(templateProjectNode).html();
      for (i = 0; i < data.length; i++) {
        project = data[i];
        node = nunjucks.renderString(template, {
          project: project,
          url: util.url,
          createdAt: util.dateToString(project.createdAt),
          updatedAt: util.dateToString(project.updatedAt)
        });
        $(tableProjects).append(node);
      }
    });
  };
});
