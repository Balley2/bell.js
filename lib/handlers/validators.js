/**
 * @overview  Parameter validators.
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */

'use strict';

const errors = require('./errors');

/**
 * Validate project name.
 * @param {String} name
 * @return {String}
 * @throws ErrProjectName
 */
exports.validateProjectName = function(name) {
  name = name || '';
  name = name.trim();
  if (name.length === 0)
    throw errors.ErrProjectName;
  return name;
};

/**
 * Validate project id.
 * @param {String} id
 * @return {Number}
 * @throws ErrProjectId
 */
exports.validateProjectId = function(id) {
  id = +id;
  if (isNaN(id) || id < 0)
    throw errors.ErrProjectId;
  return id;
};

/**
 * Validate rule pattern.
 * @param {String} pattern
 * @return {String}
 * @throws ErrRulePattern
 */
exports.validateRulePattern = function(pattern) {
  pattern = pattern || '';
  pattern = pattern.trim();
  if (pattern.length === 0)
    throw errors.ErrRulePattern;
  return pattern;
};

/**
 * Validate rule content.
 * @param {Object} data
 * @return {String} content
 * @throws ErrRuleContent
 */
exports.validateRuleContent = function(data) {
  if (typeof data.up !== 'boolean' ||
      typeof data.down !== 'boolean' ||
      (data.min !== null && typeof data.min !== 'number') ||
        (data.max !== null && typeof data.max !== 'number'))
        throw errors.ErrRuleContent;
   return data;
};

/**
 * Validate rule id.
 * @param {String} id
 * @return {Number}
 * @throws ErrRuleId
 */
exports.validateRuleId = function(id) {
  id = +id;
  if (isNaN(id) || id < 0)
    throw errors.ErrRuleId;
  return id;
};

/**
 * Validate receiver id.
 * @param {Number} id
 * @return {Number}
 * @throws ErrReceiverId
 */
exports.validateReceiverId = function(id) {
  id = +id;
  if (isNaN(id) || id < 0)
    throw errors.ErrReceiverId;
  return id;
};

/**
 * Validate receiver name.
 * @param {String} name
 * @return {String}
 * @throws ErrReceiverName
 */
exports.validateReceiverName = function(name) {
  name = name || '';
  name = name.trim();
  if (name.length === 0)
    throw errors.ErrReceiverName;
  return name;
};

/**
 * Validate email.
 * @param {String} email
 * @return {String}
 * @throws ErrEmail
 */
exports.validateEmail = function(email) {
  if (email.indexOf('@') <= 0)
    throw errors.ErrEmail;
  return email;
};

/**
 * Validate phone.
 * @param {String} phone
 * @return {String}
 * @throws ErrPhone
 */
exports.validatePhone = function(phone) {
  if (phone.match(/^\d{10,11}/)) {
    return phone;
  }
  throw errors.ErrPhone;
};

/**
 * Validate receiver universal.
 * @param {Boolean} universal
 * @return {Boolean}
 * @throws ErrReceiverUniversal
 */
exports.validateReceiverUniversal = function(universal) {
  if (typeof universal === 'undefined')
    universal = false;
  if (typeof universal !== 'boolean')
    throw errors.ErrReceiverUniversal;
  return universal;
};

/**
 * Validate receiver `enableEmail`
 * @param {Boolean} enableEmail
 * @return {Boolean}
 * @throws ErrReceiverEnableEmail
 */
exports.validateReceiverEnableEmail = function(enableEmail) {
  if (typeof enableEmail === 'undefined')
    enableEmail = false;
  if (typeof enableEmail !== 'boolean')
    throw errors.ErrReceiverEnableEmail;
  return enableEmail;
};

/**
 * Validate receiver `enablePhone`
 * @param {Boolean} enablePhone
 * @return {Boolean}
 * @throws ErrReceiverEnablePhone
 */
exports.validateReceiverEnablePhone = function(enablePhone) {
  if (typeof enablePhone === 'undefined')
    enablePhone = false;
  if (typeof enablePhone !== 'boolean')
    throw errors.ErrReceiverEnablePhone;
  return enablePhone;
};
