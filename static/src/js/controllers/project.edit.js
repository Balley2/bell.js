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
  dom.name.error = $('.section-project-name form .error');
  dom.del = {};
  dom.del.button = $('.section-project-delete button.project-delete-confirmed');
  dom.del.error = $('.section-project-delete .error');
  dom.rule = {};
  dom.rule.add = {};
  dom.rule.add.error = $('.section-project-rules .rule-add .error');
  dom.rule.add.form = $('.section-project-rules form.rule-add');
  dom.rule.list = {};
  dom.rule.list.error = $('.section-project-rules .rule-list .error');
  dom.rule.list.list = $('.section-project-rules .rule-list');
  dom.rule.list.template = $('.section-project-rules #template-rule-node');
  dom.rule.del = {};
  dom.rule.del.error = $('.section-project-rules .rule-list .error');
  dom.rule.del.button = $('.section-project-rules button.rule-delete');
  dom.receiver = {};
  dom.receiver.add = {};
  dom.receiver.add.error = $('.section-project-receivers .receiver-add .error');
  dom.receiver.add.form = $('.section-project-receivers form.receiver-add');
  dom.receiver.list = {};
  dom.receiver.list.error = $('.section-project-receivers .receiver-list .error');
  dom.receiver.list.list = $('.section-project-receivers .receiver-list');
  dom.receiver.list.template = $('.section-project-receivers #template-receiver-node');
  dom.receiver.remove = {};
  dom.receiver.remove.error = $('.section-project-receivers .receiver-list .error');
  dom.receiver.remove.button = $('.section-project-receivers button.receiver-remove');

  //------------------------------------------------------
  // Initializations
  //------------------------------------------------------
  self.init = function() {
    id = window._ctx.id;
    self.loadProject();
    self.loadRules();
    self.loadReceivers();
    self.initEvents();
  };
  /**
   * Init event listeners.
   */
  self.initEvents = function() {
    dom.name.form.submit(self.patchName);
    dom.del.button.click(self.deleteProject);
    dom.rule.add.form.submit(self.addRule);
    dom.receiver.add.form.submit(self.addReceiver);
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
    handlers.project.getRules(id, function(err, rules) {
      if (err) {
        handlers.error.error(err, dom.rule.list.error);
        return;
      }
      rules.forEach(self.appendRuleNode);
    });
  };
  /**
   * Load receivers.
   */
  self.loadReceivers = function() {
    handlers.project.getReceivers(id, function(err, receivers) {
      if (err) {
        handlers.error.error(err, dom.receiver.list.error);
        return;
      }
      receivers.forEach(self.appendReceiverNode);
    });
  };
  //------------------------------------------------------
  // Rule nodes
  //------------------------------------------------------
  /**
   * Append rule node.
   * @param {Object} rule
   * @param {String} speed
   */
  self.appendRuleNode = function(rule, speed) {
    var template = dom.rule.list.template.html();
    var html = nunjucks.renderString(template, {rule: rule});
    dom.rule.list.list.append(html);
    var selector = util.format(".rule-list li[data-id*=%d]", rule.id);
    $(selector).appendTo(dom.rule.list.list).show(speed);
    $(selector).find('.rule-delete').click(self.deleteRule);
  };
  /**
   * Remove rule node.
   * @param {Number} id
   */
  self.removeRuleNode = function(id) {
    var selector = util.format(".rule-list li[data-id*=%d]", id);
    $(selector).hide(500, function() {
      $(selector).remove();
    });
  };
  /**
   * Append receiver node.
   * @param {Object} reciever
   * @param {String} speed
   */
  self.appendReceiverNode = function(receiver, speed) {
    var template = dom.receiver.list.template.html();
    var node = nunjucks.renderString(template, {
      receiver: receiver,
      url: util.url
    });
    dom.receiver.list.list.append(node);
    var selector = util.format(".receiver-list li[data-id*=%d]", receiver.id);
    $(selector).appendTo(dom.receiver.list.list).show(speed);
    $(selector).find('.receiver-remove').click(self.removeReceiver);
  };
  /**
   * Remove receiver node.
   * @param {Number} id
   */
  self.removeReceiverNode = function() {
    var selector = util.format(".receiver-list li[data-id*=%d]", id);
    $(selector).hide(500, function() {
      $(selector).remove();
    });
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
        handlers.error.error(err, dom.name.error);
        return;
      }
      handlers.error.ok('Project name updated', dom.name.error);
    });
  };
  /**
   * Delete project on click.
   * @param {Event} event
   */
  self.deleteProject = function(event) {
    handlers.project.del(id, function(err, data) {
      if (err) {
        handlers.error.error(err, dom.del.error);
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
    var form = this;
    data.up = data.up === 'on';
    data.down = data.down === 'on';
    data.min = +data.min ? +data.min : null;
    data.max = +data.max ? +data.max : null;
    handlers.rule.add(id, data, function(err, rule) {
      if (err) {
        handlers.error.error(err, dom.rule.add.error);
        return;
      }
      handlers.error.ok("Rule added", dom.rule.add.error);
      self.appendRuleNode(rule, 500);
      form.reset();
    });
  };
  /**
   * Delete rule.
   * @param {Event} event
   */
  self.deleteRule = function(event) {
    var id = +$(this).data('id');
    handlers.rule.del(id, function(err, data) {
      if (err) {
        handlers.error.error(err, dom.rule.del.error);
        return;
      }
      handlers.error.ok("Rule deleted", dom.rule.del.error);
      self.removeRuleNode(id);
    });
  };
  /**
   * Add receiver on submit.
   * @param {Event} event
   */
  self.addReceiver = function(event) {
    event.preventDefault();
    var data = util.collectForm(this);
    var form = this;
    handlers.receiver.add(id, data, function(err, receiver) {
      if (err) {
        handlers.error.error(err, dom.receiver.add.error);
        return;
      }
      handlers.error.ok("Receiver added", dom.receiver.add.error);
      self.appendReceiverNode(receiver, 500);
      form.reset();
    });
  };
  /**
   * Remove receiver from project.
   * @param {Event} event
   */
  self.removeReceiver = function(event) {
    var receiverId = +$(this).data('id');
    handlers.receiver.remove(id, receiverId, function(err, data) {
      if (err) {
        handlers.error.error(err, dom.receiver.remove.error);
        return;
      }
      handlers.error.ok("Receiver removed", dom.receiver.remove.error);
      self.removeReceiverNode(receiverId);
    });
  };
});
