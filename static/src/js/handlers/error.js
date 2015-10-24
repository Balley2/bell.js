/**
 * @overview  Error handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('error', function(self, util) {
  var selector = "#error";
  var template = $("#template-error").html();
  /**
   * Render fatal error
   * @param {Error} err
   */
  self.fatal = function(err) {
    if (!err)
      return;
    var html = nunjucks.renderString(template, {
      type: 'danger',
      msg: err.toString()
    });
    return $(selector).html(html);
  };
});
