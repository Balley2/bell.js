/**
 * @overview  Handler rule.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const route = require('koa-route');
const errors = require('./errors');
const models = require('../models');
const url = require('../url');

//------------------------------------------
// Register rule handler to service.
//------------------------------------------
exports.register = function(service) {
  service.app.use(route.patch(url('/api/admin/project/:id/rule'), add));
};

//------------------------------------------
// Util functions
//------------------------------------------
/**
 * Validate rule pattern.
 * @param {String} pattern
 * @return {String}
 * @throws ErrRulePattern
 */
function validateRulePattern(pattern) {
  pattern = pattern || '';
  pattern = pattern.trim();
  if (pattern.length === 0)
    throw errors.ErrRulePattern;
  return pattern;
}

/**
 * Validate rule content.
 * @param {Object} data
 * @return {String} content
 * @throws ErrRuleContent
 */
function validateRuleContent(data) {
  if (typeof data.up !== 'boolean' ||
      typeof data.down !== 'boolean' ||
      (data.upMin !== null && typeof data.upMin !== 'number') ||
        (data.downMax !== null && typeof data.downMax !== 'number'))
        throw errors.ErrRuleContent;
   return data;
}

//------------------------------------------
// Rule handlers
//------------------------------------------
/**
 * Add rule to project.
 * @api /api/admin/project/:id/rule
 * @method POST
 * @param {String} pattern
 * @param {Number} up
 * @param {Number} upMin
 * @param {Number} down
 * @param {Number} downMax
 * @return {Rule}
 * @throws ErrProjectNotFound/ErrProjectId/ErrParameter
 */
function *add(id) {
  id = validateId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw errors.ErrProjectNotFound;
  var data = validateRuleContent(this.request.body);
  data.pattern = validateRulePattern(data.pattern);
  this.body = yield project.addRule(data);
}
