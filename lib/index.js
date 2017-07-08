'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _install = require('./install');

var _install2 = _interopRequireDefault(_install);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// plugin support
/**
 * Model
 * based on path-to-regexp, axios and bluebird
 *
 * @author xiaomi
 */

_model2.default.install = _install2.default;

// Vue use
if (typeof Vue !== 'undefined') {
  // eslint-disable-next-line
  Vue.use(_model2.default);
}

exports.default = _model2.default;
module.exports = exports['default'];