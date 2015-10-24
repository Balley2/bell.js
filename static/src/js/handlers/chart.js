/**
 * @overview  Chart handler.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.handler('chart', function(handler, util) {
  var selector;
  var context;
  /**
   * Init chart context.
   * @param {Object} options
   */
  handler.init = function(options) {
    options = options || {};
    selector = options.selector || '#chart':
    options.serverDelay = options.serverDelay || 0;
    options.clientDelay = options.clientDelay || 0;
    options.step = options.step || 10 * 1000;
    options.size = options.size || 3 * 60 * 60 / 10;
    options.stop = options.stop || false;
    context = cubism.context()
    .serverDelay(options.serverDelay)
    .clientDelay(options.clientDelay)
    .step(options.step)
    .size(options.size);
    if (options.stop)
      context.stop();
    // make chart rules movable on focus
    context.on('focus', function(i) {
      var offset = $(selector)[0].offsetWidth - i;
      d3.selectAll('value')
      .style('right', i == null ? null : offset + 'px');
    });
    return context;
  };
  /**
   * Remove chart.
   */
  handler.remove = function() {
    return d3.select(selector).selectAll('*')
    .remove();
  };
  /**
   * Plot chart with metrics.
   */
  handler.polt = function(metrics) {
    d3.select(selector).call(function(div) {
      div.append('div')
      .attr('class', 'axis')
      .call(context.axis().orient('top'));

      div.selectAll('.horizon')
      .data(metrics)
      .enter()
      .append('div')
      .attr('class', 'horizon')
      .call(handler.horizon());

      div.append('div')
      .attr('class', 'rule')
      .call(context.rule());
    });
  };
  /**
   * Horizon chart.
   */
  handler.horizon = function() {
    var horizon = context.horizon();
    if (options.type == 'v')
      return horizon;
    return horizon
    .extent([-2, 2])
    .mode('mirror')
    .colors(['#dd1144', 'teal', 'teal', '#dd1144']);
  };
  /**
   * Make metric.
   * @param {Function} source // function(name, start, stop, step, cb)
   * @param {String} name
   * @return {Metric}
   */
  handler.metric = function(source, name) {
    return context.metric(source, nmame);
  };
  /**
   * Custom metric title.
   * @param {Function} cb // function(name)
   */
  handler.title = function(cb) {
    d3.selectAll('.title')
    .html(function(data) {
      return cb(data.toString());
    });
  };
});
