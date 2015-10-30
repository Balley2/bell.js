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
  dom.rule = {};
  dom.rule.add = {};
  dom.rule.add.form = $('.section-project-rules form.rule-add');
  dom.rule.list = {};
  dom.rule.list.list = $('.section-project-rules .rule-list');
  dom.rule.list.template = $('.section-project-rules #template-rule-node');
  dom.rule.del = {};
  dom.rule.del.button = $('.section-project-rules button.rule-delete');

  //------------------------------------------------------
  // Initializations
  //------------------------------------------------------
  self.init = function() {
    id = window._ctx.id;
    self.loadProject();
    self.loadRules();
    self.initEvents();
  };
  /**
   * Init event listeners.
   */
  self.initEvents = function() {
    dom.name.form.submit(self.patchName);
    dom.del.button.click(self.deleteProject);
    dom.rule.add.form.submit(self.addRule);
  };
  //------------------------------------------------------
  // Loaders.
  //------------------------------------------------------
  /**
   * Load project to dom.
   */
  self.loadProject = function() {
    handlers.project.get(id, function(err, project) {
      if (err) {
        handlers.error.error(err);
        return;
      }
      util.fillForm(dom.name.form, project);
    });
  };
  /**
   * Load rules.
   */
  self.loadRules = function() {
    handlers.rule.gets(id, function(err, rules) {
      if (err) {
        handlers.error.error(err);
        return;
      }
      rules.forEach(self.appendRule);
    });
  };
  //------------------------------------------------------
  // Rule nodes
  //------------------------------------------------------
  /**
   * Append rule node.
   * @param {Object} rule
   */
  self.appendRule = function(rule) {
    var template = dom.rule.list.template.html();
    var html = nunjucks.renderString(template, {rule: rule});
    dom.rule.list.list.append(html);
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
        "Project deleted, redirecting page in 2 seconds..",
        dom.del.error);
      setTimeout(function() {
        window.location.href = util.url('/admin/project');
      }, 2000);
    });
  };
  /**
   * Add rule on submit.
   * @param {Event} event
   */
  self.addRule = function(event) {
    event.preventDefault();
    var data = util.collectForm(this);
    data.up = data.up === 'on';
    data.down = data.down === 'on';
    data.min = +data.min ? +data.min : null;
    data.max = +data.max ? +data.max : null;
    handlers.rule.add(id, data, function(err, rule) {
      if (err) {
        handlers.error.error(err);
        return;
      }
      self.appendRule(rule);
    });
  };
  /**
   * Delete rule.
   * @param {Event} event
   */
  self.delRule = function(event) {
    // FIXME
  };
});
