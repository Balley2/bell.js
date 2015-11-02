/**
 * @overview  Receiver controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('receiver', function(self, handlers, util) {
  //------------------------------------------------------
  // HTML DOM Selectors
  //------------------------------------------------------
  var dom = {};
  dom.create = {};
  dom.create.form = $('.receiver-create form');
  dom.create.error = ('.receiver-create .error');
  dom.list = {};
  dom.list.list = $('.receiver-list tbody');
  dom.list.template = $('.receiver-list #template-receiver-node');
  dom.list.error = $('.receiver-list .error');
  //------------------------------------------------------
  // Event handlers
  //------------------------------------------------------
  /**
   * Entry
   */
  self.init = function() {
    self.list();
    self.initCreate();
  };
  /**
   * Append receiver to list.
   * @param {Object} receiver
   * @param {String} speed
   */
  self.append = function(receiver, speed) {
    var template = dom.list.template.html();
    var node = nunjucks.renderString(template, {
      receiver: receiver,
      url: util.url,
    });
    dom.list.list.append(node);
    var selector = util.format(".receiver-list tr[data-id*=%d]", receiver.id);
    $(selector).appendTo(dom.list.list).show(speed);
  };
  /**
   * List rceivers.
   */
  self.list = function() {
    handlers.receiver.getAll(function(err, receivers) {
      if (err) {
        handlers.error.error(err, dom.list.error);
        return;
      }
      receivers.forEach(self.append);
    });
  };
  /**
   * Init create.
   */
  self.initCreate = function() {
    dom.create.form.submit(function(event) {
      event.preventDefault();
      var data = util.collectForm(this);
      var form = this;
      data.universal = data.universal === 'on';
      data.enableEmail = data.enableEmail === 'on';
      data.enablePhone = data.enablePhone === 'on';
      handlers.receiver.create(data, function(err, receiver) {
        if (err) {
          handlers.error.error(err, dom.create.error);
          return;
        }
        self.append(receiver, 500);
        form.reset();
        handlers.error.ok("Receiver created", dom.create.error);
      });
    });
  };
});
