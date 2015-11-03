/**
 * @overview  Receiver edit controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('receiver.edit', function(self, handlers, util) {
  var id;
  //------------------------------------------------------
  // HTML DOM Selectors
  //------------------------------------------------------
  var dom = {};
  dom.edit = {};
  dom.edit.form = $('.receiver-edit form');
  dom.edit.error = $('.receiver-edit .error');
  dom.projects = {};
  dom.projects.list = $('.receiver-projects .project-list');
  dom.projects.error = $('.receiver-projects .error');
  dom.projects.template = $('.receiver-projects #template-project-node');
  //------------------------------------------------------
  // Initializations
  //------------------------------------------------------
  self.init = function() {
    id = window._ctx.id;
    self.initEvents();
    self.loadReceiver();
    self.loadProjects();
  };
  self.initEvents = function() {
    dom.edit.form.submit(self.patchReceiver);
  };
  //------------------------------------------------------
  // Loaders
  //------------------------------------------------------
  self.loadReceiver = function() {
    handlers.receiver.get(id, function(err, receiver) {
      if (err) {
        handlers.error.error(err, dom.edit.error);
        return;
      }
      util.fillForm(dom.edit.form, receiver);
    });
  };
  self.loadProjects = function() {
    handlers.receiver.getProjects(id, function(err, projects) {
      if (err) {
        handlers.error.error(err, dom.projects.error);
        return;
      }
      projects.forEach(self.appendProjectNode);
    });
  };
  /**
   * @param {Object} project
   */
  self.appendProjectNode = function(project) {
    var template = dom.projects.template.html();
    var node = nunjucks.renderString(template, {
      project: project,
      url: util.url
    });
    dom.projects.list.append(node);
  };
  //------------------------------------------------------
  // Event listeners
  //------------------------------------------------------
  /**
   * @param {Event} event
   */
  self.patchReceiver = function(event) {
    event.preventDefault();
    var data = util.collectForm(dom.edit.form);
    data.universal = data.universal === 'on';
    data.enableEmail = data.enableEmail === 'on';
    data.enablePhone = data.enablePhone === 'on';
    handlers.receiver.patch(id, data, function(err, data) {
      if (err) {
        handlers.error.error(err, dom.edit.error);
        return;
      }
      handlers.error.ok("Saved", dom.edit.error);
    });
  };
});
