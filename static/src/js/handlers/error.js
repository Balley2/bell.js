/**
 * @overview  Error handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('error', function(self, util) {
  var template = $("#template-error").html();
  var expiration = 5 * 1000;
  /**
   * Render error message.
   * @param {Error} err
   * @param {String} className
   */
  self.render = function(err, type, selector) {
    if (!err)
      return;
    selector = selector || '#error';
    var html = nunjucks.renderString(template, {
      type: type,
      msg: err.toString()
    });
    $(selector).html(html);
    setTimeout(function() {
      $(selector).html('');
    }, expiration);
  };
  /**
   * Render fatal error
   * @param {Error} err
   */
  self.fatal = function(err, selector) {
    self.render(err, 'danger', selector);
    throw new Error(err);
  };
  /**
   * Render error
   * @param {Error} err
   */
  self.error = function(err, selector) {
    return self.render(err, 'danger', selector);
  };
  /**
   * Render warning
   * @param {Error} err
   */
  self.warn = function(err, selector) {
    return self.render(err, 'warning', selector);
  };
  /**
   * Render info
   * @param {Error} err
   */
  self.info = function(err, selector) {
    return self.render(err, 'info', selector);
  };
  /**
   * Render success
   * @param {Error} err
   */
  self.ok = function(err, selector) {
    return self.render(err, 'success', selector);
  };
});
