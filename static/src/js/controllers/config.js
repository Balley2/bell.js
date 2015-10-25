/**
 * @overview  Config controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('config', function(self, handlers, util) {
  /**
   * Entry.
   */
  self.init = function() {
    handlers.config.get(function(err, data) {
      if (err)
        return handlers.error.fatal(err);
      var text = JSON.stringify(data, undefined, 2);
      $('pre#container-server-config').html(text);
    });
  };
});
