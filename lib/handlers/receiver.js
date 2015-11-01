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
  // service.app.use(route.get(url('/api/admin/receiver/:id'), get));
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
 * @return {Receiver}
 * @throws ErrReceiver..
 */
function *create() {
  var data = {};
  data.name = validators.validateReceiverName(this.request.body.name);
  data.email = validators.validateEmail(this.request.body.email);
  data.phone = validators.validatePhone(this.request.body.phone);
  data.universal = validators.validateReceiverUniversal(this.request.body.universal);
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
