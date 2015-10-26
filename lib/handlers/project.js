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
};

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
  var name = this.request.body.name;
  if (!name || name.length === 0) {
    this.status = 400;
    this.body = {msg: "Invalid name"};
    return;
  }
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
  if (!name || name.length === 0) {
    this.status = 400;
    this.body = {msg: "Invalid name"};
    return;
  }
  var project = yield models.Project.findOne({where: {name: name}});
  if (!project) {
    this.status = 404;
    this.body = {msg: "Not found"};
    return;
  }
  yield project.destroy();
  // FIXME: remove recievers and rules
  this.status = 204;
}

/**
 * Get project by name.
 */
function *get(name) {
  if (!name || name.length === 0) {
    this.status = 400;
    this.body = {msg: "Invalid name"};
    return;
  }
  var project = yield models.Project.findOne({where: {name: name}});
  if (!project) {
    this.status = 404;
    this.body = {msg: "Not found"};
    return;
  }
  project.rules = yield project.getRules();
  project.receivers = yield project.getReceivers();
  this.body = project;
}
