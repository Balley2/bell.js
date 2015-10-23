/**
 * @overview  Index controller..
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

app.controller('index', function(controller, handlers, util) {
  // global vars
  var context;
  var options;
  var interval;
  var pastSecs;

  controller.init = function() {
    options = window._ctx.options;
    interval = window._ctx.interval;
    pastSecs = util.timeSpanToSeconds(options.past);
    initContext();
    util.setIntervalAndRunNow(function() {
      d3.select('#chart').selectAll('*').remove();
      pullMetricNames(function(data) {
        // renderQueryStatistics(data);
        // plotChart(data);
      });
    }, 10 * 60 * 1000); // replot every 10 min
  };

  /**
   * Create chart with options.
   */
  function initContext() {
    context = cubism.context()
    .serverDelay(pastSecs * 1000)
    .clientDelay(0)
    .step(interval * 1000)
    .size(3 * 60 * 60 / 10)  // 3 hours, step 10s
    ;
    if (options.stop == 1)
      context.stop();
    context.on('focus', function(i) {
      var offset = $('#chart')[0].offsetWidth - i;
      d3.selectAll('.value')
      .style('right', i === null ? null : offset + 'px');
    });
  };

  /**
   * Pull metric data.
   * @param {String} name
   * @param {Function} cb // function(data)
   */
  function pullMetricData(name, cb) {
    return context.metric(function(start, stop, step, callback) {
      var values = [], i = 0;
      // cast to timestamp from date
      start = (+start - pastSecs) / 1000;
      stop = (+stop - pastSecs) / 1000;
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
        cb && cb(data);
      });
    }, name);
  }

  /**
   * Pull metric names.
   *
   * @param {Function} cb // function(data)
   */
  function pullMetricNames(cb) {
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
      var stat = {}; // {name: trend}
      var list = [], i;
      var pairs, name, trend;
      $('#loader').hide();
      for (i = 0; i < data.names.length; i++) {
        pairs = data.names[i];
        name = pairs[0];
        trend = pairs[1];
        list.push(pullMetricData(name, renderMetricTitle));
        stat[name] = trend;
      }
      // cb && cb(list);
      renderQueryStatistics(data);
      plotChart(list);
    });
  }

  /**
   * Get a horizon chart.
   */
  function getHorizonChart() {
      var horizon = context.horizon();
      if (options.type == 'v')
        return horizon;
      return horizon
      .extent([-2, 2])
      .mode('mirror')
      .colors(['#dd1144', 'teal', 'teal', '#dd1144']);
  }

  /**
   * Plot chart on data.
   */
  function plotChart(data) {
    d3.select('#chart').call(function(div) {
      div.append('div')
      .attr('class', 'axis')
      .call(context.axis().orient('top'));

      div.selectAll('.horizon')
      .data(data)
      .enter().append('div')
      .attr('class', 'horizon')
      .call(getHorizonChart());

      div.append('div')
      .attr('class', 'rule')
      .call(context.rule());
    });
  }

  /**
   * Polt master.
   */
  function plot(data) {

  }

  /**
   * Render metric title.
   */
  function renderMetricTitle(data) {
    // FIXME
  }

  /**
   * Render query statistics.
   */
  function renderQueryStatistics(data) {
    var template = $("#template-query-statistics").html();
    var html = nunjucks.renderString(template, {
      numHit: data.total,
      numReturn: data.length,
      numAnomalous: data.mcount
    });
    $('#query-statistics').html(html);
  }
});
