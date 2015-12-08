/**
 * @overview  Util functions
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

//------------------------------------------
// Exports
//------------------------------------------
exports.objectLength = objectLength;
exports.updateNestedObjects = updateNestedObjects;
exports.loadObjectFromPath = loadObjectFromPath;
exports.cleanWith = cleanWith;
exports.diffArray = diffArray;
exports.uniqueArray = uniqueArray;
exports.join = join;
exports.urlEncode = urlEncode;
exports.urlDecode = urlDecode;
exports.urlParamsEncode = urlParamsEncode;
exports.fastMatch = fastMatch;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.fileOnChanges = fileOnChanges;
exports.fileOnChangesWithMinInterval = fileOnChangesWithMinInterval;
exports.fileOnChangesWithMinIntervalAndRunNow = fileOnChangesWithMinIntervalAndRunNow;
exports.patchBeansClient = patchBeansClient;
exports.ReadOnlyArray = ReadOnlyArray;
exports.setIntervalAndRunNow = setIntervalAndRunNow;
exports.timerStart = timerStart;

// extend all utils from standlib util
util._extend(module.exports, util);

//------------------------------------------
// Objects
//------------------------------------------

function objectLength(obj) {
  return Object.keys(obj).length;
}

/**
 * Update nested objects in place.
 *
 * example:
 *
 *   updateNestedObjects({x: 1, y: {z: 2}}, {x: 2, y: {z: 3, p: 4}, q: 5})
 *   // => {x: 2, y: {z: 3, p: 4}, q: 5}
 *
 *  @param {Object} obj
 *  @param {Object} other
 *  @return {Object} // obj
 */
function updateNestedObjects(obj, other) {
  var tmp, key, val;

  for (key in other) {
    if (other.hasOwnProperty(key)) {
      val = other[key];
      if (val !== null && typeof val === 'object' && !(val instanceof Array)) {
        // val is an object
        if (obj[key] === undefined) {
          tmp = obj[key] = {};
        } else {
          tmp = obj[key];
        }
        updateNestedObjects(tmp, val);
      } else {
        obj[key] = val;
      }
    }
  }
  return obj;
}

/**
 * Load object from file path.
 *
 * @param {String} filePath
 * @return {Object}
 */
function loadObjectFromPath(path) {
  var content = fs.readFileSync(path);
  return eval('var _; _ = ' + content);
}

/**
 * Pop key and val from an object only if the key and value are
 * all the same. (In place)
 *
 * @param {Object} obj
 * @param {Object} other
 * @return {Object} // obj
 */
function cleanWith(obj, other) {
  for (var key in obj) {
    if (key in other && obj.hasOwnProperty(key) && obj[key] === other[key])
      delete obj[key];
  }
  return obj;
}

/**
 * Diff arrays, return true on diff.
 * @param {Object} a
 * @param {Object} b
 * @param {Object} eq
 * @return {Boolean}
 */
function diffArray(a, b, eq) {
  if (a.length !== b.length)
    return true;

  var i, j, found;

  eq = eq || function(x, y) {
    return x === y;
  };

  for (i = 0; i < b.length; i++) {
    found = false;
    for (j = 0; j < b.length; j++) {
      if (eq(a[i], b[j])) {
        found = true;
      }
    }
    if (!found)
      return true;
  }
  return false;
}

/**
 * Make array unique.
 * @param {Array} arr
 * @param {Function} eq
 * @return {Array}
 */
function uniqueArray(arr, eq) {
  eq = eq || function(x, y) {
    return x === y;
  };

  var ret = [], i, j, a, b, found;

  for (i = 0; i < arr.length; i++) {
    a = arr[i];
    found = false;
    for (j = 0; j < ret.length; j++) {
      b = ret[j];
      if (eq(a, b)) {
        found = true;
      }
    }
    if (!found)
      ret.push(a);
  }
  return ret;
}

//------------------------------------------
// Strings
//------------------------------------------
/**
 * Join pathes and normalize the result, e.g.
 *
 *    join('a', 'b', 'c')
 *    // => 'a/b/c'
 */
function join() {
  var result = path.join.apply(this, arguments);
  return path.normalize(result);
}

/**
 * Encode url parameters
 * @param {Object} params
 * @return {String}
 */
function urlParamsEncode(params) {
  var pairs = [], key, val, item;
  for (key in params) {
    val = params[key];
    item = [encodeURIComponent(key), encodeURIComponent(val)];
    pairs.push(item.join('='));
  }
  return pairs.join('&');
}

/**
 * Encode url with parameters.
 * @param {String} path
 * @param {Object} params
 */
function urlEncode(path, params) {
  if (!params)
    return path;
  var s = path + '?' + urlParamsEncode(params);
  return s.replace(/\?$/g, '');
}

/**
 * Decode url to path and parameters.
 * @param {String} s
 * @return {Object}
 */
function urlDecode(s) {
  return url.parse(s, true);
}

/**
 * Minimatch is too slow.
 */
function fastMatch(s, pattern) {
  var arr = pattern.split('*');
  var prefix = arr[0];
  var suffix = arr[1];
  if (typeof suffix === 'undefined')
    return prefix === s;
  return startsWith(s, prefix) && endsWith(s, suffix);
}

function startsWith(s, prefix) {
  return s.indexOf(prefix) === 0;
}

function endsWith(s, suffix) {
  return s.indexOf(suffix, s.length - suffix.length) !== -1;
}


//------------------------------------------
// Files
//------------------------------------------

/**
 * Nodejs `fs.watch` currently not working well on osx,
 * here offers a compatiable way to do something if any
 * changes are made to the file.
 *
 * @param {String} file
 * @param {Function} callback // function()
 * @param {Number} intervalDarwin // in ms, default: 2000
 */
function fileOnChanges(file, callback, intervalDarwin) {
  if (process.platform == 'darwin') {
    intervalDarwin = intervalDarwin || 2000;
    return fs.watchFile(file, {interval: intervalDarwin}, function(curr, prev) {
      if (curr.mtime != prev.mtime)
        return callback();
    });
  } else {
    return fs.watch(file, function(event, filename) {
      if (event == 'change')
        return callback();
    });
  }
}

/**
 * Watch file changes and do something if the `mtime`
 * is larger than `mtimeLast + interval`.
 *
 * @param {String} file
 * @param {Function} callback // function()
 * @param {Numberl} interval // in ms, default: 2000
 */
function fileOnChangesWithMinInterval(file, callback, interval) {
  interval = interval || 2000;

  if (process.platform == 'darwin') {
    return fs.watchFile(file, {interval: interval}, function(curr, prev) {
      if (curr.mtime != prev.mtime)
        return callback();
    });
  } else {
    var mtime = new Date();
    return fs.watch(file, function(event, filename) {
      var mtimeNow = new Date();
      if (event == 'change' && ((mtimeNow - mtime) >= interval)) {
        mtime = mtimeNow;
        return callback();
      }
    });
  }
}

/*
 * @param {String} file
 * @param {Function} callback // function()
 * @param {Numberl} interval // in ms, default: 2000
 */
function fileOnChangesWithMinIntervalAndRunNow(file, callback, interval) {
  callback();
  fileOnChangesWithMinInterval(file, callback, interval);
}

//------------------------------------------
// Hacks
//------------------------------------------

/**
 * Thunkify fivebeans `reserve` method.
 *
 * @param {Object} c  // fivebeans client
 */
function patchBeansClient(c) {
  var reserve = function(cb) {
    c.reserve(cb);
  };

  c._reserve = function() {
    return function(cb) {
      var _cb = function(e, jid, buf) {
        cb(e, {
          id: jid,
          body: buf.toString()
        });
      };
      reserve.apply(this, [_cb]);
    };
  };
}

//------------------------------------------
// Math
//------------------------------------------

/**
 * ReadOnly array
 */
function ReadOnlyArray(array) {
  this.array = array;
  this.cache = {};
  this.length = array.length;
  return this;
}

ReadOnlyArray.prototype.mean = function() {
  var i, sum, mean;

  if (typeof this.cache.mean !== 'undefined')
    return this.cache.mean;

  for (i = 0, sum = 0; i < this.length; i++)
    sum += this.array[i];

  mean = sum / this.length;
  this.cache.mean = mean;
  return mean;
};

ReadOnlyArray.prototype.std = function() {
  var i, mean, sum, dis, std;

  if (typeof this.cache.std !== 'undefined')
    return this.cache.std;

  mean = this.mean();

  for (i = 0, sum = 0; i < this.length; i++) {
    dis = this.array[i] - mean;
    sum += dis * dis;
  }

  std = Math.sqrt(sum / this.length);
  this.cache.std = std;
  return std;
};

//------------------------------------------
// Timers
//------------------------------------------

function setIntervalAndRunNow(fn, ms) {
  fn();
  return setInterval(fn, ms);
}

function timerStart() {
  var startAt = new Date();
  startAt.elapsed = function() {
    return new Date() - startAt;
  };
  return startAt;
}
