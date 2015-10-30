/**
 * @overview  API Errors
 * @author    Chao Wang (hit9)
 * @copyright 2015 Eleme, Inc. All rights reserved.
 */
// jshint -W124

'use strict';

const errors = {
  ErrProjectName: {code: 400, msg: "Invalid project name"},
  ErrProjectId: {code: 400, msg: "Invalid project id"},
  ErrProjectNotFound: {code: 404, msg: "Project not found"},
  ErrProjectDuplicateName: {code: 403, msg: "Duplicate project name"},
  ErrRulePattern: {code: 400, msg: "Invalid rule pattern"},
  ErrRuleContent: {code: 400, msg: "Invalid rule content"},
  ErrRuleId: {code: 400, msg: "Invalid rule id"},
  ErrRuleNotFound: {code: 404, msg: "Rule not found"},
  ErrRuleDuplicatePattern: {code: 403, msg: "Duplicate rule pattern"},
};

module.exports = errors;
errors.register = function(service) {
  service.app.use(function*(next) {
    try {
      yield next;
    } catch(err) {
      if (!(err instanceof Error)) {
        this.status = err.code;
        this.body = {msg: err.msg};
      } else {
        this.status = 500;
        throw err;
      }
    }
  });
};
