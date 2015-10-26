/**
 * @overview  Handler project.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const route = require('koa-route');
const Sequelize = require('sequelize');
const models = require('../models');
const url = require('../url');

var sequelize;

//------------------------------------------
// Register project handler to service.
//------------------------------------------
exports.register = function(service) {
  sequelize = service.sequelize;
  service.app.use(route.post(url('/api/admin/project/create'), create));
};

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
