'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * ModelBase
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author xiaomi
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isArray = Array.isArray;
var rUpdateMethod = /^(POST|PUT|PATCH)$/i;

var defaultGetPagination = function defaultGetPagination(response) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x-pagination';

    var pagination = null;

    try {
        var headers = response.headers;

        pagination = JSON.parse(headers[key]);
    } catch (ex) {}

    if (!pagination) {
        pagination = {
            total: 0,
            size: 20,
            num: 1
        };
    }

    return pagination;
};

var ModelBase = function () {
    function ModelBase(data) {
        _classCallCheck(this, ModelBase);

        this.$defineResult();

        this.$reset(data);
    }

    _createClass(ModelBase, [{
        key: '$defineResult',
        value: function $defineResult() {
            var _this = this;

            var innerProps = {
                promise: _bluebird2.default.resolve(this),
                resolved: true,
                response: null
            };

            _lodash2.default.forEach(innerProps, function (val, k) {
                Object.defineProperty(_this, '$' + k, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: val
                });
            });
        }
    }, {
        key: '$reset',
        value: function $reset(data) {
            var _this2 = this;

            _lodash2.default.forEach(this, function (val, k) {
                if (k !== '$resolved') {
                    delete _this2[k];
                }
            });

            if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
                _lodash2.default.forEach(data, function (val, k) {
                    _this2.$set(k, val);
                });
            }

            return this;
        }
    }, {
        key: '$set',
        value: function $set(key, val) {
            this[key] = val;
        }
    }, {
        key: '$request',
        value: function $request(options) {
            var Model = this.constructor;

            options = _lodash2.default.clone(options);

            // mixin params, data
            options.params = _lodash2.default.assign({}, Model.params, options.params);

            // all data for url
            var allData = _lodash2.default.assign({}, options.params, options.data);

            // clear params
            _lodash2.default.forEach(Model.urlTokens, function (token) {
                if (token && token.name) {
                    delete options.params[token.name];
                }
            });

            // wrap by bluebird
            // support Cancellation
            return new _bluebird2.default(function (resolve, reject, onCancel) {
                options = _lodash2.default.assign({
                    url: Model.url(allData)
                }, Model.options, options);

                // clean
                if (!rUpdateMethod.test(options.method)) {
                    delete options.data;
                }

                // cancellation
                if (typeof onCancel === 'function') {
                    (function () {
                        var source = _axios2.default.CancelToken.source();

                        onCancel(function () {
                            source.cancel('Request canceled');
                        });

                        options.cancelToken = source.token;
                    })();
                }

                return Model.http.request(options).then(resolve, reject);
            });
        }
    }], [{
        key: 'extend',
        value: function extend(url, actions, staticProps, options) {
            var Model = function (_ref) {
                _inherits(Model, _ref);

                function Model() {
                    _classCallCheck(this, Model);

                    return _possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).apply(this, arguments));
                }

                return Model;
            }(this);

            var urlTokens = _pathToRegexp2.default.parse(url);

            // optional last token
            var urlLastToken = urlTokens[urlTokens.length - 1];
            if ((typeof urlLastToken === 'undefined' ? 'undefined' : _typeof(urlLastToken)) === 'object') {
                urlLastToken.optional = true;
            }

            Model.url = _pathToRegexp2.default.tokensToFunction(urlTokens);
            Model.urlTokens = urlTokens;
            Model.options = options;

            // staic props
            _lodash2.default.assign(Model, staticProps);

            // actions
            _lodash2.default.forEach(actions, function (action, name) {
                Model.addAction(name, action);
            });

            return Model;
        }
    }, {
        key: 'addAction',
        value: function addAction(name, action) {
            var method = action.method;
            var hasPagination = action.hasPagination;
            var isArrayResult = !!(action.isArray || hasPagination);
            var isUpdateMethod = rUpdateMethod.test(method);

            this.prototype['$' + name] = function (params) {
                var _this4 = this;

                var Model = this.constructor;

                // update
                if (isUpdateMethod) {
                    _lodash2.default.forEach(params, function (val, k) {
                        _this4.$set(k, val);
                    });

                    return Model[name](this).$promise;
                }

                return Model[name](params, this).$promise;
            };

            this[name] = function (params, data) {
                var Model = this;
                var ModelOptions = Model.options || {};

                // switch params
                if (isUpdateMethod) {
                    var _ref2 = [params, data];
                    data = _ref2[0];
                    params = _ref2[1];
                }

                // mixin params
                params = _lodash2.default.assign({}, action.params, params);

                // getPagination
                var getPagination = ModelOptions.getPagination ? ModelOptions.getPagination : defaultGetPagination;

                var model = data instanceof Model ? data : new Model(data);
                var result = isArrayResult ? hasPagination ? {
                    pagination: getPagination(),
                    items: []
                } : [] : model;

                // cacher, only support non update method
                var cacher = action.cacher || Model.cacher;
                var allowCacher = action.allowCacher;
                var fetchCache = function fetchCache() {
                    if (!isUpdateMethod && allowCacher && cacher) {
                        var cache = cacher.get(params, Model, result);

                        _lodash2.default.merge(result, cache);
                    }
                };
                var updateCache = function updateCache() {
                    if (!isUpdateMethod && allowCacher && cacher) {
                        cacher.set(result, params, Model);
                    }
                };

                fetchCache();

                // options
                var options = _lodash2.default.assign({
                    params: params,
                    data: model
                }, action);

                // set $resolved
                model.$set.call(result, '$resolved', false);

                result.$promise = model.$request(options).then(function (response) {
                    var data = response.data;

                    result.$response = response;

                    if (isArray(data) !== isArrayResult) {
                        throw new Error('Model.' + name + ' expected an ' + (isArrayResult ? 'array' : 'object') + ' but got an ' + (isArray(data) ? 'array' : 'object'));
                    }

                    if (!isArrayResult) {
                        model.$reset(data);
                    } else {
                        (function () {
                            var items = hasPagination ? result.items : result;

                            // fill items
                            items.length = 0;
                            data.forEach(function (item) {
                                items.push(new Model(item));
                            });

                            if (hasPagination) {
                                var pagination = getPagination(response);
                                _lodash2.default.assign(result.pagination, pagination);
                            }
                        })();
                    }

                    // update cache
                    updateCache();

                    return result;
                }).finally(function () {
                    model.$set.call(result, '$resolved', true);
                });

                return result;
            };
        }
    }]);

    return ModelBase;
}();

ModelBase.cacher = null;
ModelBase.http = _axios2.default.create();
exports.default = ModelBase;
module.exports = exports['default'];