/**
 * @overview  Sequelize orm models.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const Sequelize = require('sequelize');

/**
 * Register models with sequelize instance.
 *
 * @param {Sequelize} sequelize
 * @return {Object}  // exports
 */
exports.register = function(sequelize) {
  var Project = sequelize.define('Project', {
    name: {type: Sequelize.STRING, unique: true},
  });

  var Rule = sequelize.define('Rule', {
    pattern: {type: Sequelize.STRING, unique: true},
    up: {type: Sequelize.BOOLEAN, defaultValue: false},
    down: {type: Sequelize.BOOLEAN, defaultValue: false},
    min: {type: Sequelize.DOUBLE, defaultValue: null, allowNull: true},
    max: {type: Sequelize.DOUBLE, defaultValue: null, allowNull: true},
  });

  var Receiver = sequelize.define('Receiver', {
    name: {type: Sequelize.STRING, unique: true},
    email: {type: Sequelize.STRING, unique: true},
    phone: {type: Sequelize.STRING, unique: true},
    universal: {type: Sequelize.BOOLEAN, defaultValue: false},
    enableEmail: {type: Sequelize.BOOLEAN, defaultValue: false},
    enablePhone: {type: Sequelize.BOOLEAN, defaultValue: false},
  });

  Project.hasMany(Rule, {as: 'Rules'});
  Project.belongsToMany(Receiver, {through: 'ReceiverProjects'});
  Receiver.belongsToMany(Project, {through: 'ReceiverProjects'});

  exports.Project = Project;
  exports.Rule = Rule;
  exports.Receiver = Receiver;
  return exports;
};
