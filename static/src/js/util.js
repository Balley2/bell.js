/**
 * @overview  Util functiona.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

/**
 * Convert date to readable string format
 * @param {Date} date
 * @return {String}
 */
app.util.dateToString = function(date) {
  if (!(date instanceof Date))
    date = new Date(date);
  // getMonth() return 0~11 numbers
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  // normalize
  year = '' + year;
  month = ('00' + month).slice(-2);
  day = ('00' + day).slice(-2);
  hours = ('00' + hours).slice(-2);
  minutes = ('00' + minutes).slice(-2);
  seconds = ('00' + seconds).slice(-2);
  return [year, month, day].join('/') + ' ' + [hours, minutes, seconds].join(':');
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
  var s = route + '?' + list.join('&');
  return s.replace(/\?$/g, '');
};

/**
 * Send requests with options
 * @param {Object} options
 * @param {Function} cb
 */
app.util.request = function(options, cb) {
  options = options || {};
  options.noReturn = options.noReturn || false;
  if (!options.noReturn)
    options.dataType = 'json';
  if (!options.type || !options.url)
    throw new Error('invalid options to send request');
  if (options.data) {
    options.contentType = 'application/json';
    options.processData = false;
    options.data = JSON.stringify(options.data);
  }
  if (options.noReturn) {
    options.success = options.success || function() {
      return cb(null, null);
    };
  } else {
    options.success = options.success || function(data) {
      return cb(null, data);
    };
  }
  options.error = options.error || function(xhr, status) {
    var msg, text, err;
    try {
      msg = JSON.parse(xhr.responseText).msg;
    } catch(e) {
      msg = xhr.responseText;
    }
    text = app.util.format('%s: %s', xhr.status, msg);
    err = new Error(text);
    return cb(err, null);
  };
  return $.ajax(options);
};

/**
 * GET request with json.
 * @param {String} url
 * @param {Function} cb // function(err, data)
 */
app.util.get = function(url, cb) {
  return app.util.request({
    type: 'GET',
    url: url
  }, cb);
};

/**
 * POST request with json.
 * @param {String} url
 * @param {Function} cb // function(err, data)
 */
app.util.post = function(url, data, cb) {
  return app.util.request({
    type: 'POST',
    url: url,
    data: data
  }, cb);
};

/**
 * DELETE request with json.
 * @param {String} url
 * @param {Function} cb // function(err)
 */
app.util.delete = function(url, cb) {
  return app.util.request({
    type: 'DELETE',
    url: url,
    noReturn: true
  }, cb);
};

/**
 * PATCH request with json.
 * @param {String} url
 * @param {Function} cb // function(err)
 */
app.util.patch = function(url, data, cb) {
  return app.util.request({
    type: 'PATCH',
    url: url,
    data: data,
    noReturn: true
  }, cb);
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

/**
 * SetInterval and run right now.
 * @param {Function} fn
 * @param {Number} ms // milliseconds
 */
app.util.setIntervalAndRunNow = function(fn, ms) {
  fn();
  return setInterval(fn, ms);
};

/**
 * Collect form data.
 * @param {FormElement} form
 */
app.util.collectForm = function(form) {
  var data = {};
  $(form).serializeArray().map(function(child) {
    if (child.name)
      data[child.name] = child.value;
  });
  return data;
};

/**
 * Fill form with data.
 * @param {FormElement} form
 * @param {Object} data
 */
app.util.fillForm = function(form, data) {
  $(form).find('input,textarea').each(function(i, child) {
    if (child.name in data) {
      $(child).val(data[child.name]);
    }
  });
};

/**
 * Render html from src to dest with data.
 * @param {String} src
 * @param {Strings} dest
 * @param {Object} data
 */
app.util.render = function(src, dest, data) {
  var template = $(src).html();
  var html = nunjucks.renderString(template, data);
  return $(dest).html(html);
};
