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
  //------------------------------------------------------
  // Event handlers
  //------------------------------------------------------
  /**
   * Entry
   */
  self.init = function() {
    // self.list(); // FIXME
    self.initCreate();
  };
  /**
   * Append receiver to list.
   */
  self.append = function(receiver) {
    // FIXME
  };
  /**
   * List rceivers.
   */
  self.list = function() {
  };
  /**
   * Init create.
   */
  self.initCreate = function() {
    dom.create.form.submit(function(event) {
      event.preventDefault();
      var data = util.collectForm(this);
      data.universal = data.universal === 'on';
      handlers.receiver.create(data, function(err, receiver) {
        if (err) {
          handlers.error.error(err);
          return;
        }
        // self.append(receiver); // FIXME
        handlers.error.ok("Receiver created");
      });
    });
  };
});
