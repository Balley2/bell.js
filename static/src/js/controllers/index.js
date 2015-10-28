/**
 * @overview  Index controller.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('index', function(self, handlers, util) {
  var options;
  var delay;
  var loader = $('#loader');
  /**
   * Index entry.
   */
  self.init = function() {
    options = window._ctx.options;
    delay = util.timeSpanToSeconds(options.past);
    // init chart
    handlers.chart.init({
      selector: '#chart',
      serverDelay: delay * 1000,
      step: window._ctx.interval * 1000,
      stop: options.stop == 1,
      type: options.type
    });
    // init scrollbars
    self.initScrollbars();
    // init sidebar
    self.initSidebar();
    // start plot
    util.setIntervalAndRunNow(function() {
      handlers.chart.remove();
      self.getNames(function(data) {
        self.renderStats(data);
        self.plot(data);
        self.initTitles(data);
      });
    }, 10 * 60 * 1000);
  };
  /**
   * Feed metric.
   * @param {String} name
   * @param {Function} cb // function(data)
   * @return {Metric}
   */
  self.feed = function(name, cb) {
    return handlers.chart.metric(function(start, stop, step, callback) {
      var values = [], i = 0;
      // cast to timestamp from date
      start = (+start - delay) / 1000;
      stop = (+stop - delay) / 1000;
      step = +step / 1000;
      // parameters to pull data
      var params = {
        name: name,
        type: options.type,
        start: start,
        stop: stop
      };
      // request data and call `callback` with values
      // data schema: {name: {String}, times: {Array}, vals: {Array}}
      handlers.metric.getData(params, function(err, data) {
        if (err)
          return handlers.error.fatal(err);
        // the timestamps from statsd DONT have exactly steps `10`
        while (start < stop) {
          while (start < data.times[i]) {
            start += step;
            values.push(start > data.times[i] ? data.vals[i] : 0);
          }
          values.push(data.vals[i++]);
          start += step;
        }
        callback(null, values);
        if (cb)
          cb(data);
      });
    }, name);
  };
  /**
   * Fetch names
   * @param {Function} cb // function(data)
   */
  self.getNames = function(cb) {
    var params = {
      limit: options.limit,
      sort: options.sort,
    };
    if (options.project) {
      params.project = options.project;
    } else {
      params.pattern = options.pattern;
    }
    // request metric names by params
    handlers.metric.getNames(params, function(err, data) {
      if (err)
        return handlers.error.fatal(err);
      loader.hide();
      if (cb)
        cb(data);
    });
  };
  /**
   * Plot.
   */
  self.plot = function(data) {
    var name, i, metrics = [];
    for (i = 0; i < data.names.length; i++) {
      name = data.names[i][0];
      metrics.push(self.feed(name, self.refreshTitle));
    }
    return handlers.chart.plot(metrics);
  };
  /**
   * Render statistics
   */
  self.renderStats = function(data) {
    return util.render('#template-query-statistics',
                       '#query-statistics', data);
  };
  /**
   * Init titles
   */
  self.initTitles = function(data) {
    var stats = {}, i, name, trend;
    for (i = 0; i < data.names.length; i++) {
      name = data.names[i][0];
      trend = data.names[i][1];
      stats[name] = trend;
    }
    return handlers.chart.title(function(name) {
      var template = $('#template-title').html();
      var trend = stats[name];
      return nunjucks.renderString(template, {
        name: name,
        trend: trend,
        trendText: self.getTextByTrend(trend),
        className: self.getClassNameByTrend(trend),
        url: util.url('/', {
          pattern: name,
          sort: options.sort,
          limit: 1,
          type: options.type,
          past: options.past,
        })
      });
    });
  };
  /**
   * Refresh title
   * @param {Object} data
   */
  self.refreshTitle = function(data) {
    $(util.format("title-%s", data.name))
    .toggleClass(self.getClassNameByTrend(data.trend));
    $(util.format("title-trend-%s", data.name))
    .html(self.getTextByTrend(data.trend));
  };
  /**
   * Get title class name.
   * @param {Number} trend
   * @return {String}
   */
  self.getClassNameByTrend = function(trend) {
    if (Math.abs(trend) >= 1)
      return 'anomalous';
    return 'normal';
  };
  /**
   * Get trend text.
   * @param {Number} trend
   * @return {String}
   */
  self.getTextByTrend = function(trend) {
    if (trend > 0)
      return '↑';
    if (trend < 0)
      return '↓';
    return '-';
  };
  /**
   * Scrollbars
   */
  self.initScrollbars = function() {
    $('.chart-box-top').scroll(function() {
      $('.chart-box').scrollLeft($('.chart-box-top').scrollLeft());
    });
    $('.chart-box').scroll(function() {
      $('.chart-box-top').scrollLeft($('.chart-box').scrollLeft());
    });
  };
  /**
   * Init sidebar.
   */
  self.initSidebar = function() {
    handlers.project.getAll(function(err, data) {
      if (err)
        return handlers.error.error(err);
      var i, project, url, list, src, template, node;

      list = $('#projects');
      template = $('#template-project-node').html();

      for (i = 0; i < data.length; i++) {
        project = data[i];
        url = util.url('/', {project: project.id});
        node = nunjucks.renderString(template, {
          name: project.name,
          url: url,
          current: options.project
        });
        list.append(node);
      }
    });
  };
});
