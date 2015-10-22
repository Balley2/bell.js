/**
 * @overview  Sequelize orm models.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const Sequelize = require('sequelize');

exports.register = function(sequelize) {
  var Project = sequelize.define('Project', {
    name: {type: Sequelize.STRING, unique: true},
  });

  var Rule = sequelize.define('Rule', {
    pattern: {type: Sequelize.STRING},
    content: {type: Sequelize.STRING},
  });

  var Receiver = sequelize.define('Receiver', {
    name: {type: Sequelize.STRING, unique: true},
    email: {type: Sequelize.STRING, unique: true},
    phone: {type: Sequelize.STRING, unique: true},
  });

  var Dashboard = sequelize.define('Dashboard', {
    name: {type: Sequelize.STRING},
    patterns: {type: Sequelize.TEXT},
  });

  Project.hasMany(Rule, {as: 'Rules'});
  Project.belongsToMany(Receiver, {through: 'ReceiverProject'});
  Receiver.belongsToMany(Project, {through: 'ReceiverProject'});

  exports.Project = Project;
  exports.Rule = Rule;
  exports.Receiver = Receiver;
  exports.Dashboard = Dashboard;
  return exports;
};
