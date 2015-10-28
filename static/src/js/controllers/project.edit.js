/**
 * @overview  Project edit controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('project.edit', function(self, handlers, util) {
  var id;
  //------------------------------------------------------
  // HTML DOM Selectors
  //------------------------------------------------------
  var dom = {};
  dom.name = {};
  dom.name.form = $('.section-project-name form');
  dom.del = {};
  dom.del.button = $('.section-project-delete button.project-delete-confirmed');
  dom.del.error = $('.section-project-delete .error');

  //------------------------------------------------------
  // Initializations
  //------------------------------------------------------
  self.init = function() {
    id = window._ctx.id;
    self.load();
    self.initEvents();
  };
  /**
   * Init event listeners.
   */
  self.initEvents = function() {
    dom.name.form.submit(self.patchName);
    dom.del.button.click(self.deleteProject);
  };
  //------------------------------------------------------
  // Handler functions
  //------------------------------------------------------
  /**
   * Load project to dom.
   */
  self.load = function() {
    handlers.project.getFull(id, function(err, project) {
      if (err) {
        handlers.error.error(err);
        return;
      }
      self.fillName(project);
    });
  };
  /**
   * Fill name form.
   * @param {Object} project
   */
  self.fillName = function(project) {
    return util.fillForm(dom.name.form, project);
  };
  //------------------------------------------------------
  // Event listeners
  //------------------------------------------------------
  /**
   * Patch name on form submit.
   * @param {Event} event
   */
  self.patchName = function(event) {
    event.preventDefault();
    var data = util.collectForm(this);
    handlers.project.patch(id, data.name, function(err, data) {
      if (err) {
        handlers.error.error(err);
        return;
      }
      handlers.error.ok('Project name updated');
    });
  };
  /**
   * Delete project on click.
   * @param {Event} event
   */
  self.deleteProject = function(event) {
    handlers.project.del(id, function(err, data) {
      if (err) {
        handlers.error.error(err);
        return;
      }
      handlers.error.ok(
        "Project deleted, redirecting page in 3 seconds..",
        dom.del.error);
      setTimeout(function() {
        window.location.href = util.url('/admin/project');
      }, 3000);
    });
  };
});
