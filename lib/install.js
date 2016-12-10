'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = install;

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _modelBase = require('./model-base');

var _modelBase2 = _interopRequireDefault(_modelBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Vue.js plugin support
 *
 * @author xiaomi
 */

function install(Vue) {
    // override set to support reactive property
    _modelBase2.default.prototype.$set = function (key, val) {
        // ignore array
        if (Array.isArray(this)) {
            this[key] = val;

            return;
        }

        var isResolvedKey = key === '$resolved';

        // reset property
        if (isResolvedKey && this.__ob__) {
            var dp = Object.getOwnPropertyDescriptor(this, key);

            if (dp && !dp.get && dp.configurable) {
                delete this[key];
            }
        }

        // set reactive property
        Vue.set(this, key, val);

        // disable property enumerable
        if (isResolvedKey) {
            var _dp = Object.getOwnPropertyDescriptor(this, key);

            if (_dp && _dp.enumerable) {
                _dp.enumerable = false;

                Object.defineProperty(this, key, _dp);
            }
        }
    };

    // export
    Vue.http = _modelBase2.default.http;
    Vue.Model = _model2.default;
};
module.exports = exports['default'];