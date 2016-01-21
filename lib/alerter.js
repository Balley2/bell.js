/**
 * @overview  Bell alerter service.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

// jshint -W124

'use strict';

const minimatch = require('minimatch');
const config = require('./config');
const crons = require('./crons');
const log = require('./log');
const models = require('./models');
const service = require('./service');
const util = require('./util');

function Alerter() {}
util.inherits(Alerter, service);

/**
 * Serve entry.
 */
Alerter.prototype.serve = function *() {
  var self = this;
  this.stats = {};  // {name: stamp}
  this.loadSender();
  // reload sender on config reloading
  config.emitter.on('reload', function() {
    if (self.sender)
      delete require.cache[require.resolve(config.alerter.sender)];
    self.loadSender();
  });
  this.createSequelize();
  models.register(this.sequelize);
  crons.register(this);
  this.createSocketServer(config.alerter.port, function(item) {
    self.send({
      name: item[0][0],
      stamp: item[0][1][0],
      value: item[0][1][1],
      trend: item[1],
      mean: item[2],
    });
  });
  yield this.sequelize.sync();
  crons.syncProjectsOnDBFileChanges();
};

Alerter.prototype.loadSender = function() {
  if (config.alerter.sender) {
    log.info("load sender from %s", config.alerter.sender);
    this.sender = require(config.alerter.sender);
  } else {
    log.warn("no sender module configured");
  }
};

/**
 * Send alerting message on anomaly detected.
 * @param {Object} data
 */
Alerter.prototype.send = function(data) {
  var projects = crons.ctx.projects;
  var project, rule, receiver, i, j, k;

  if (!this.stats[data.name])
    this.stats[data.name] = 0;

  for (i = 0; i < projects.length; i++) {
    project = projects[i];
    for (j = 0; j < project.rules.length; j++) {
      rule = project.rules[j];
      if (this.test(data, rule) &&
          ((data.stamp - this.stats[data.name]) >= config.alerter.interval)) {
            for (k = 0; k < project.receivers.length; k++) {
              receiver = project.receivers[k];
              if (this.sender.sendEmail && receiver.enableEmail)
                this.sender.sendEmail(receiver, project, data, log);
              if (this.sender.sendSms && receiver.enablePhone)
                this.sender.sendSms(receiver, project, data, log);
            }
            if (this.sender.sendCallback) {
              this.sender.sendCallback(project, data, log);
            }
          this.stats[data.name] = data.stamp;
          }
    }
  }
};

/**
 * Test anomaly detection item against rule
 * @param {Array} data
 * @param {Rule} rule
 * @return {Boolean}
 */
Alerter.prototype.test = function(data, rule) {
  if (!minimatch(data.name, rule.pattern))
    return false;
  if (!((rule.up && (data.trend >= 1)) || (rule.down && (data.trend <= -1))))
    return false;
  if ((data.trend >= 1) && (rule.min !== null) && (rule.min > data.value))
    return false;
  if ((data.trend <= -1) && (rule.max !== null) && (rule.max < data.value))
    return false;
  return true;
};

module.exports = new Alerter();
