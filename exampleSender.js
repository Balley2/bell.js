/**
 * Bell alerter sender example.
 */

const util = require('util');

exports.sendEmail = function(email, data, log) {
  var date = new Date(data.stamp * 1000).toTimeString().slice(0, 8);
  var value = data.value.toFixed(2);
  var trend = data.trend.toFixed(2);
  // format message and send email
};

exports.sendSms = function(phone, data, log) {
  // similar with `sendEmail`
};
