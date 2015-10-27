/**
 * @overview  Handler project.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const route = require('koa-route');
const Sequelize = require('sequelize');
const crons = require('../crons');
const models = require('../models');
const url = require('../url');

var sequelize;

//------------------------------------------
// Register project handler to service.
//------------------------------------------
exports.register = function(service) {
  sequelize = service.sequelize;
  service.app.use(route.get(url('/api/projects'), getAll));
  service.app.use(route.get(url('/api/admin/projects'), getAll));
  service.app.use(route.post(url('/api/admin/project'), create));
  service.app.use(route.del(url('/api/admin/project/:name'), del));
  service.app.use(route.get(url('/api/admin/project/:name'), get));
  service.app.use(route.patch(url('/api/admin/project/:name'), patch));
};

//------------------------------------------
// Util functions
//------------------------------------------
function validateName(ctx, name) {
  name = name || '';
  name = name.trim();

  if (name.length === 0) {
    ctx.status = 400;
    ctx.body = {msg: "Invalid name"};
    return;
  }
  return name;
}

function *getProjectByName(ctx, name) {
  var project = yield models.Project.findOne({
    where: {name: name}
  });

  if (!project) {
    ctx.status = 404;
    ctx.body = {msg: "Not found"};
    return;
  }
  return project;
}

//------------------------------------------
// Project handlers
//------------------------------------------
/**
 * Get all projects.
 */
function *getAll() {
  this.body = yield models.Project.findAll();
}

/**
 * Create an empty project.
 */
function *create() {
  var name = validateName(this, this.request.body.name);
  if (!name)
    return;
  try {
    this.body = yield models.Project.create({name: name});
  } catch(err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      this.status = 403;
      this.body = {msg: "Duplicate name"};
    }
  }
}

/**
 * Delete project by name.
 */
function *del(name) {
  name = validateName(this, name)
  if (!name)
    return;
  var project = yield getProjectByName(this, name);
  if (!project)
    return;
  yield project.destroy();
  // FIXME: remove recievers and rules
  this.status = 204;
}

/**
 * Get project by name.
 */
function *get(name) {
  name = validateName(this, name);
  if (!name)
    return;
  var project = yield getProjectByName(this, name);
  if (!project)
    return;
  project.rules = yield project.getRules();
  project.receivers = yield project.getReceivers();
  this.body = project;
}

/**
 * Patch project by name.
 */
function *patch(name) {
  name = validateName(this, name);
  if (!name)
    return;
  var project = yield getProjectByName(this, name);
  if (!project) {
    return;
  }
  name = validateName(this, this.request.body.name);
  if (!name)
    return;
  project.name = name;
  yield project.save();
  this.status = 204;
}
