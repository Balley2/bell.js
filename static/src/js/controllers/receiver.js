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
  dom.list = {};
  dom.list.list = $('.receiver-list .list-group');
  dom.list.template = $('.receiver-list #template-receiver-node');
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
    var selector = util.format(".receiver-list li[data-id*=%d]", receiver.id);
    console.log($(selector));
    $(selector).appendTo(dom.list.list).show(speed);
  };
  /**
   * List rceivers.
   */
  self.list = function() {
    handlers.receiver.getAll(function(err, receivers) {
      if (err) {
        handlers.error.error(err);
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
      handlers.receiver.create(data, function(err, receiver) {
        if (err) {
          handlers.error.error(err);
          return;
        }
        self.append(receiver, 500);
        form.reset();
        handlers.error.ok("Receiver created");
      });
    });
  };
});
