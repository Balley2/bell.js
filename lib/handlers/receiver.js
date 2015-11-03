/**
 * @overview  Handler receiver.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const route = require('koa-route');
const Sequelize = require('sequelize');
const errors = require('./errors');
const models = require('../models');
const url = require('../url');
const validators = require('./validators');

//------------------------------------------
// Register receiver handler to service.
//------------------------------------------
exports.register = function(service) {
  service.app.use(route.get(url('/api/admin/receivers'), getAll));
  service.app.use(route.post(url('/api/admin/project/:id/receiver'), add));
  service.app.use(route.post(url('/api/admin/receiver'), create));
  service.app.use(route.del(url('/api/admin/project/:projectId/receiver/:receiverId'), remove));
  service.app.use(route.get(url('/api/admin/receiver/:id'), get));
  service.app.use(route.get(url('/api/admin/receiver/:id/projects'), getProjects));
  service.app.use(route.patch(url('/api/admin/receiver/:id'), patch));
  service.app.use(route.del(url('/api/admin/receiver/:id'), del));
};

//------------------------------------------
// Receiver handlers
//------------------------------------------
/**
 * Create receiver.
 * @api /api/admin/receiver
 * @method POST
 * @param {String} name
 * @param {String} email
 * @param {String} phone
 * @param {Boolean} univeral
 * @param {Boolean} enableEmail
 * @param {Boolean} enablePhone
 * @return {Receiver}
 * @throws ErrReceiver..
 */
function *create() {
  var data = {};
  data.name = validators.validateReceiverName(this.request.body.name);
  data.email = validators.validateEmail(this.request.body.email);
  data.phone = validators.validatePhone(this.request.body.phone);
  data.universal = validators.validateReceiverUniversal(this.request.body.universal);
  data.enableEmail = validators.validateReceiverEnableEmail(this.request.body.enableEmail);
  data.enablePhone = validators.validateReceiverEnablePhone(this.request.body.enablePhone);
  try {
    this.body = yield models.Receiver.create(data);
  } catch(err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      switch(err.fields[0]) {
          case 'name':
              throw errors.ErrReceiverDuplicateName;
          case 'email':
              throw errors.ErrReceiverDuplicateEmail;
          case 'phone':
              throw errors.ErrReceiverDuplicatePhone;
      }
    }
    throw err;
  }
}

/**
 * Get all receivers.
 * @api /api/admin/receivers
 * @method GET
 * @return {Array}
 */
function *getAll() {
  this.body = yield models.Receiver.findAll();
}

/**
 * Add receiver to project.
 * @api /api/admin/project/:id/receiver
 * @method POST
 * @param {String} name
 * @return {Receiver}
 * @throws ErrReceiverNotFound/ErrProjectNotFound/ErrReceiverProjectDuplicate..
 */
function *add(id) {
  id = validators.validateProjectId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw errors.ErrProjectNotFound;
  var name = validators.validateReceiverName(this.request.body.name);
  var receiver = yield models.Receiver.findOne({where: {name: name}});
  if (!receiver)
    throw errors.ErrReceiverNotFound;
  if (receiver.universal)
    throw errors.ErrReceiverProjectDuplicate;
  if (yield project.hasReceiver(receiver))
    throw errors.ErrReceiverProjectDuplicate;
  yield project.addReceiver(receiver);
  this.body = receiver;
}

/**
 * Remove receiver from project.
 * @api /api/admin/project/:projectId/receiver/:receiverId
 * @method DELETE
 * @param {Number} projectId
 * @param {Number} receiverId
 * @return NoContent
 * @throws ErrProjectNotFound/ErrProjectId..
 */
function *remove(projectId, receiverId) {
  projectId = validators.validateProjectId(projectId);
  receiverId = validators.validateReceiverId(receiverId);
  var project = yield models.Project.findById(projectId);
  if (!project)
    throw errors.ErrProjectNotFound;
  var receiver = yield models.Receiver.findById(receiverId);
  if (!receiver)
    throw errors.ErrReceiverNotFound;
  var num = yield project.removeReceiver(receiver);
  if (!num)
    throw errors.ErrReceiverRemove;
  this.status = 204;
}

/**
 * Get receiver by id.
 * @api /api/admin/receiver/:id
 * @method GET
 * @return {Receiver}
 * @throws ErrReceiverId/ErrReceiverNotFound
 */
function *get(id) {
  id = validators.validateReceiverId(id);
  var receiver = yield models.Receiver.findById(id);
  if (!receiver)
    throw errors.ErrReceiverNotFound;
  this.body = receiver;
}

/**
 * Delete receiver by id.
 * @api /api/admin/receiver/:id
 * @method DELETE
 * @return NoContent
 * @throws ErrReceiverId/ErrReceiverNotFound
 */
function *del(id) {
  id = validators.validateReceiverId(id);
  var receiver = yield models.Receiver.findById(id);
  if (!receiver)
    throw errors.ErrReceiverNotFound;
  yield receiver.removeProjects();
  yield receiver.destroy();
  this.status = 204;
}

/**
 * Get projects by receiver id.
 * @api /api/admin/receiver/:id/projects
 * @method GET
 * @return {Array}
 * @throws ErrReceiverId/ErrReceiverNotFound
 */
function *getProjects(id) {
  id = validators.validateReceiverId(id);
  var receiver = yield models.Receiver.findById(id);
  if (!receiver)
    throw errors.ErrReceiverNotFound;
  if (receiver.universal) {
    this.body = yield models.Project.findAll();
  } else {
    this.body = yield receiver.getProjects();
  }
}

/**
 * Patch receiver.
 * @api /api/admin/receiver/:id
 * @method PATCH
 * @param {String} name
 * @param {String} email
 * @param {String} phone
 * @param {Boolean} univeral
 * @param {Boolean} enableEmail
 * @param {Boolean} enablePhone
 * @return NoContent
 * @throws ErrReceiverId/ErrReceiverNotFound
 */
function *patch(id) {
  id = validators.validateReceiverId(id);
  var receiver = yield models.Receiver.findById(id);
  if (!receiver)
    throw errors.ErrReceiverNotFound;
  receiver.name = validators.validateReceiverName(this.request.body.name);
  receiver.email = validators.validateEmail(this.request.body.email);
  receiver.phone = validators.validatePhone(this.request.body.phone);
  receiver.universal = validators.validateReceiverUniversal(this.request.body.universal);
  receiver.enableEmail = validators.validateReceiverEnableEmail(this.request.body.enableEmail);
  receiver.enablePhone = validators.validateReceiverEnablePhone(this.request.body.enablePhone);
  try {
    yield receiver.save();
  } catch(err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      switch(err.fields[0]) {
          case 'name':
              throw errors.ErrReceiverDuplicateName;
          case 'email':
              throw errors.ErrReceiverDuplicateEmail;
          case 'phone':
              throw errors.ErrReceiverDuplicatePhone;
      }
    }
    throw err;
  }
  this.status = 204;
}
