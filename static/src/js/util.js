/**
 * @overview  Util functiona.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

/**
 * Convert unix timestamp to readable string format
 * @param {Number} secs
 * @return {String}
 */
app.util.secondsToString = function(secs) {
  var date = new Date(secs * 1000);
  // getMonth() return 0~11 numbers
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  // normalize
  month = ('00' + month).slice(-2);
  day = ('00' + day).slice(-2);
  hours = ('00' + hours).slice(-2);
  minutes = ('00' + minutes).slice(-2);
  seconds = ('00' + seconds).slice(-2);
  return [month, day].join('/') + ' ' + [hours, minutes, seconds].join(':');
};

/**
 * Foramt string with arguments.
 *
 * @param {String} fmt
 * @param {Mixed} args..
 */
app.util.format = function() {
  var args = arguments;
  var fmt = args[0];
  var i = 1;
  return fmt.replace(/%((%)|s|d|f)/g, function(m) {
    if (m[2]) {
      return m[2];
    }
    var val = args[i++];
    switch(m) {
        case '%d':
            return parseInt(val);
        case '%f':
            return parseFloat(val);
        case '%s':
            return val.toString();
    }
  });
};

/**
 * Prefix url with `window._root`
 *  @param {String} route
 *  @param {Object} params
 *  @return {String}
 */
app.util.url = function(route, params) {
  var list = [], key;
  if (route[0] !== '/')
    throw new Error('except route starts with /');
  if (window._ctx.root)
    route = '/' + window._ctx.root + route;
  if (params) {
    for (key in params)
      list.push([key, '=', params[key]].join(''));
  }
  return route + '?' + list.join('&');
};

/**
 * GET request with json.
 * @param {String} url
 * @param {callback} cb // function(err, data)
 */
app.util.get = function(url, cb) {
  return $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    success: function(data) {
      return cb(null, data);
    },
    error: function(xhr, status) {
      var data = JSON.parse(xhr.responseText);
      var text = status + ':' + data.msg;
      var err = new Error(text);
      return cb(err, null);
    }
  });
};

/**
 * POST request with json.
 * @param {String} url
 * @param {callback} cb // function(err, data)
 */
app.util.post = function(url, data, cb) {
  return $.ajax({
    type: 'POST',
    url: url,
    dataType: 'json',
    contentType: 'application/json',
    processData: false,
    data: JSON.stringify(data),
    success: function(data) {
      return cb(null, data);
    },
    error: function(xhr, status) {
      var data = JSON.parse(xhr.responseText);
      var text = status + ':' + data.msg;
      var err = new Error(text);
      return cb(err, null);
    }
  });
};

/**
 * Convert string format timeSpan to seconds
 *   timeSpanToSeconds('1d')
 *   // => 86400
 *   timeSpanto('1h')
 *   // => 3600
 *   timeSpanToSeconds('1h2m')
 *   // => 3720
 * @param {String} timeSpan
 * @return {Number}
 */
app.util.timeSpanToSeconds = function(timeSpan) {
  var map = {
    's': 1,
    'm': 60,
    'h': 60 * 60,
    'd': 24 * 60 * 60
  };
  var secs = 0, i, ch, measure, count;

  while (timeSpan.length > 0) {
    for (i = 0; i < timeSpan.length; i++) {
      ch = timeSpan[i];
      measure = map[ch];
      if (!isNaN(measure)) {
        count = +timeSpan.slice(0, i);
        secs += count * measure;
        timeSpan = timeSpan.slice(i + 1);
        break;
      }
    }
    if (i === timeSpan.length)
      return secs;
  }
  return secs;
};

app.util.setIntervalAndRunNow = function(fn, ms) {
  fn();
  return setInterval(fn, ms);
};
