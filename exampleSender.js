/**
 * Bell alerter sender example.
 */

const util = require('util');

/**
 * @param {Object} receiver
 * @param {Object} project
 * @param {Object} data
 * @param {Logger} log
 */
exports.sendEmail = function(receiver, project, data, log) {
  var email = receievr.email;
  var projectName = project.name;
  var date = new Date(data.stamp * 1000).toTimeString().slice(0, 8);
  var value = data.value.toFixed(2);
  var trend = data.trend.toFixed(2);
  var mean = data.mean.toFixed(2);
  // format message and send email
};

exports.sendSms = function(receiver, project, data, log) {
  // similar with `sendEmail`
};
