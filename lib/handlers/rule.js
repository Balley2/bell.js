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
const validators = require('./validators');

//------------------------------------------
// Register rule handler to service.
//------------------------------------------
exports.register = function(service) {
  service.app.use(route.post(url('/api/admin/project/:id/rule'), add));
};

//------------------------------------------
// Util functions
//------------------------------------------

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
  id = validators.validateProjectId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw errors.ErrProjectNotFound;
  var data = validators.validateRuleContent(this.request.body);
  data.pattern = validators.validateRulePattern(data.pattern);
  this.body = yield project.createRule(data);
}
