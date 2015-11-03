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
  //------------------------------------------------------
  // Initializations
  //------------------------------------------------------
  self.init = function() {
    id = window._ctx.id;
    self.loadReceiver();
    self.initEvents();
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
