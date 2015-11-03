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
});
