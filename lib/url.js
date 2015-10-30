/**
 * @overview  Url builder with root path.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const config = require('./config');
const util = require('./util');

/**
 * Build url by route and params, e.g.
 *
 *   url('/user', {name: 'foo', age: 17})
 *   // => '/user?name=foo&age=17'
 *
 *  @param {String} route
 *  @param {Object} params
 *  @return {String}
 */

module.exports = function(route, params) {
  var s;
  if (config.webapp.root) {
    s = util.join('/', config.webapp.root, route);
  } else {
    s = util.join('/', route);
  }
  return util.urlEncode(s, params);
};
