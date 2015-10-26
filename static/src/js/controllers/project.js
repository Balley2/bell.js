/**
 * @overview  Project controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('project', function(self, handlers, util) {
  self.init = function() {
    self.initProjectCreate();
    self.listProject();
  };
  //-----------------------------------------
  // DOM
  //-----------------------------------------
  var dom = {};
  dom.project = {};
  dom.project.create = {};
  dom.project.create.modal = $('.project-create .modal');
  dom.project.create.form = $('.project-create form');
  dom.project.create.error = $('.project-create .error');
  dom.project.list = {};
  dom.project.list.tbody = $('.project-list table tbody');
  dom.project.list.template = $('#template-project-node');
  //-----------------------------------------
  // Project Create
  //-----------------------------------------
  self.initProjectCreate = function() {
    // form on submit
    dom.project.create.form.submit(function(e) {
      e.preventDefault();
      var data = util.collectForm(this);
      handlers.project.create(data.name, function(err, project) {
        if (err) {
          handlers.error.error(err, dom.project.create.error);
          return;
        }
        dom.project.create.modal.modal('hide');
        handlers.error.ok('Project created');
        self.appendProject(project);
      });
    });
    // modal on hide
    dom.project.create.modal.on('hidden.bs.modal', function(e) {
      dom.project.create.error.html('');
    });
  };
  //-----------------------------------------
  // Project List
  //-----------------------------------------
  self.appendProject = function(project) {
    var template = dom.project.list.template.html();
    var node = nunjucks.renderString(template, {
      project: project,
      url: util.url,
    });
    return dom.project.list.tbody.append(node);
  };
  self.listProject = function() {
    handlers.project.getAll(function(err, projects) {
      if (err)  {
        handlers.error.error(err);
        return;
      }
      projects.forEach(self.appendProject);
    });
  };
});
