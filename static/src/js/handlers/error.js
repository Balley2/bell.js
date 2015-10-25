/**
 * @overview  Error handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('error', function(self, util) {
  var selector = "#error";
  var template = $("#template-error").html();
  /**
   * Render error message.
   * @param {Error} err
   * @param {String} className
   */
  self.render = function(err, className) {
    if (!err)
      return;
    var html = nunjucks.renderString(template, {
      type: className,
      msg: err.toString()
    });
    return $(selector).html(html);
  };
  /**
   * Render fatal error
   * @param {Error} err
   */
  self.fatal = function(err) {
    return self.render(err, 'danger');
  };
  /**
   * Render error
   * @param {Error} err
   */
  self.error = function(err) {
    return self.render(err, 'danger');
  };
  /**
   * Render warning
   * @param {Error} err
   */
  self.warn = function(err) {
    return self.render(err, 'warning');
  };
  /**
   * Render info
   * @param {Error} err
   */
  self.info = function(err) {
    return self.render(err, 'info');
  };
  /**
   * Render success
   * @param {Error} err
   */
  self.ok = function(err) {
    return self.render(err, 'success');
  };
});
