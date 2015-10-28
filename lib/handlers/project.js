/**
 * @overview  Handler project.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const route = require('koa-route');
const Sequelize = require('sequelize');
const crons = require('../crons');
const errors = require('./errors');
const models = require('../models');
const url = require('../url');

var sequelize;

//------------------------------------------
// Register project handler to service.
//------------------------------------------
exports.register = function(service) {
  sequelize = service.sequelize;
  service.app.use(route.get(url('/api/projects'), getAll));
  service.app.use(route.get(url('/api/project/:id'), get));
  service.app.use(route.post(url('/api/admin/project'), create));
  service.app.use(route.del(url('/api/admin/project/:id'), del));
  service.app.use(route.patch(url('/api/admin/project/:id'), patch));
};

//------------------------------------------
// Util functions
//------------------------------------------
/**
 * Get name from request.
 * @param {String} name
 * @return {String}
 * @throws ErrProjectName
 */
function validateName(name) {
  var name = name || '';
  name = name.trim();
  if (name.length === 0)
    throw errors.ErrProjectName;
  return name;
}

/**
 * Get id from request.
 * @param {String} id
 * @return {Number}
 * @throws ErrProjectId
 */
function validateId(id) {
  id = +id;
  if (isNaN(id) || id < 0)
    throw errors.ErrProjectId;
  return id;
}

//------------------------------------------
// Project handlers
//------------------------------------------
/**
 * Get all projects.
 * @api /api/projects
 * @method GET
 * @return {Array}
 */
function *getAll() {
  this.body = yield models.Project.findAll();
}

/**
 * Create project.
 * @api /api/admin/project
 * @method POST
 * @param {String} name
 * @return {Project}
 * @throws ErrProjectDuplicateName/ErrProjectName
 */
function *create() {
  var name = validateName(this.request.body.name);
  try {
    this.body = yield models.Project.create({name: name});
  } catch(err) {
    if (err instanceof Sequelize.UniqueConstraintError)
      throw errors.ErrProjectDuplicateName;
    throw err;
  }
}

/**
 * Get project by id.
 * @api /api/project/:id
 * @method GET
 * @return {Project}
 * @throws ErrProjectNotFound/ErrProjectId
 */
function *get(id) {
  id = validateId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw ErrProjectNotFound;
  this.body = project;
}

/**
 * Delete project by id.
 * @api /api/admin/project/:id
 * @method DELETE
 * @return NoContent
 * @throws ErrProjectNotFound/ErrProjectId
 */
function *del(id) {
  id = validateId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw ErrProjectNotFound;
  yield project.destroy();
  // FIXME: remove related receivers and rules
  this.status = 204;
}

/**
 * Patch project by id.
 * @api /api/admin/project/:id
 * @method PATCH
 * @param {String} name
 * @return NoContent
 * @throws ErrProjectNotFound/ErrProjectId/ErrProjectName
 */
function *patch(id) {
  id = validateId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw ErrProjectNotFound;
  project.name = validateName(this.request.body.name);
  yield project.save();
  this.status = 204;
}
