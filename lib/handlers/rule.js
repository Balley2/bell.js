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
  service.app.use(route.get(url('/api/admin/project/:id/rules'), gets));
  service.app.use(route.del(url('/api/admin/project/:id'), del));
};

//------------------------------------------
// Rule handlers
//------------------------------------------
/**
 * Add rule to project.
 * @api /api/admin/project/:id/rule
 * @method POST
 * @param {String} pattern
 * @param {Boolean} up
 * @param {Boolean} down
 * @param {Number} min
 * @param {Number} max
 * @return {Rule}
 * @throws ErrProjectNotFound/ErrProjectId/ErrRuleContent
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

/**
 * Get rules by project id.
 * @api /api/admin/project/:id/rules
 * @method GET
 * @return {Array}
 * @throws ErrProjectNotFound/ErrProjectId
 */
function *gets(id) {
  id = validators.validateProjectId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw errors.ErrProjectNotFound;
  this.body = yield project.getRules();
}

/**
 * Delete rule by id.
 * @api /api/admin/rule/:id
 * @method DELETE
 * @return NoContent
 * @throws ErrRuleNotFound/ErrRuleId
 */
function *del(id) {
 id = validators. validateRuleId(id);
 var rule = yield models.Rule.findById(id);
 if (!rule)
   throw errors.ErrRuleNotFound;
 yield rule.destroy();
 this.status = 204;
}
