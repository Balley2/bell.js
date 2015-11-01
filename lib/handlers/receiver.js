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
  service.app.use(route.get(url('/api/admin/receiver/:id/receivers'), gets));
  service.app.use(route.post(url('/api/admin/project/:id/receiver'), add));
  service.app.use(route.post(url('/api/admin/receiver'), create));
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
 * @return {ReceiverProject}
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
  var options = {
    ReceiverId: receiver.id,
    ProjectId: project.id
  };
  var row = yield models.ReceiverProjects.findOne({where: options});
  if (row)
    throw errors.ErrReceiverProjectDuplicate;
  this.body = yield models.ReceiverProjects.create({
    ReceiverId: receiver.id,
    ProjectId: project.id
  });
}

/**
 * Get receivers by project id.
 * @api /api/admin/project/:id/receivers
 * @method GET
 * @return {Array}
 * @throws ErrProjectNotFound/ErrProjectId..
 */
function *gets(id) {
  id = validators.validateProjectId(id);
  var project = yield models.Project.findById(id);
  if (!project)
    throw errors.ErrProjectNotFound;
  this.body = yield project.getReceivers();
}
