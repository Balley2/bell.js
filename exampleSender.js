/**
 * Bell alerter sender example.
 */

const util = require('util');

/**
 * @param {String} email
 * @param {Object} project
 * @param {Object} data
 * @param {Logger} log
 */
exports.sendEmail = function(email, project, data, log) {
  var projectName = project.name;
  var date = new Date(data.stamp * 1000).toTimeString().slice(0, 8);
  var value = data.value.toFixed(2);
  var trend = data.trend.toFixed(2);
  // format message and send email
};

exports.sendSms = function(phone, project, data, log) {
  // similar with `sendEmail`
};
