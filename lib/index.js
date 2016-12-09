(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'axios', 'lodash', 'bluebird', 'path-to-regexp'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('axios'), require('lodash'), require('bluebird'), require('path-to-regexp'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.axios, global.lodash, global.bluebird, global.pathToRegexp);
        global.index = mod.exports;
    }
})(this, function (module, _axios, _lodash, _bluebird, _pathToRegexp) {
    'use strict';

    var _axios2 = _interopRequireDefault(_axios);

    var _lodash2 = _interopRequireDefault(_lodash);

    var _bluebird2 = _interopRequireDefault(_bluebird);

    var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var isArray = Array.isArray;
    var rUpdateMethod = /^(POST|PUT|PATCH)$/i;

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

                // fix params
                _lodash2.default.forEach(Model.urlTokens, function (token) {
                    if (token && token.name) {
                        delete options.params[token.name];
                    }
                });

                // wrap by bluebird
                return _bluebird2.default.try(function () {
                    options = _lodash2.default.assign({
                        url: Model.url(allData)
                    }, Model.options, options);

                    // clean
                    if (!rUpdateMethod.test(options.method)) {
                        delete options.data;
                    }

                    return Model.http.request(options);
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

                this.prototype['$' + name] = function (params) {
                    var _this4 = this;

                    var Model = this.constructor;
                    var result = void 0;

                    // update
                    if (rUpdateMethod.test(method)) {
                        _lodash2.default.forEach(params, function (val, k) {
                            _this4.$set(k, val);
                        });

                        result = Model[name](this);
                    } else {
                        result = Model[name](params, this);
                    }

                    return result.$promise;
                };

                this[name] = function (params, data) {
                    var Model = this;

                    // switch params
                    if (rUpdateMethod.test(method)) {
                        var _ref2 = [params, data];
                        data = _ref2[0];
                        params = _ref2[1];
                    }

                    var model = data;
                    if (!(model instanceof Model)) {
                        model = new Model(data);
                    }

                    var result = model;

                    if (isArrayResult) {
                        result = hasPagination ? {
                            pagination: { total: 0, size: 20, num: 1 },
                            items: []
                        } : [];

                        model.$defineResult.call(result);
                    }

                    // mixin params
                    params = _lodash2.default.assign({}, action.params, params);

                    var options = _lodash2.default.assign({
                        params: params,
                        data: model
                    }, action);

                    var promise = model.$request(options).then(function (res) {
                        result.$response = res;

                        var data = res.data;

                        if (isArray(data) !== isArrayResult) {
                            throw new Error('Model.' + name + ' expected an ' + (isArrayResult ? 'array' : 'object') + ' but got an ' + (isArray(data) ? 'array' : 'object'));
                        }

                        if (!isArrayResult) {
                            return model.$reset(data);
                        }

                        var items = hasPagination ? result.items : result;

                        // fill items
                        data.forEach(function (item) {
                            items.push(new Model(item));
                        });

                        if (hasPagination) {
                            var pagination = null;
                            var headers = res.headers;
                            var paginationHeader = 'x-pagination';

                            try {
                                pagination = headers[paginationHeader];
                                pagination = JSON.parse(pagination);
                            } catch (ex) {}

                            if (!pagination) {
                                throw new Error(paginationHeader + ' get/parse error');
                            }

                            _lodash2.default.assign(result.pagination, pagination);
                        }

                        return result;
                    }).finally(function () {
                        model.$set.call(result, '$resolved', true);
                    });

                    model.$set.call(result, '$resolved', false);
                    result.$promise = promise;

                    return result;
                };
            }
        }]);

        return ModelBase;
    }();

    ModelBase.http = _axios2.default.create();


    // Model
    var Model = ModelBase.extend('', {
        get: { method: 'GET' },
        save: { method: 'POST' },
        update: { method: 'PUT' },
        delete: { method: 'DELETE' },
        query: { method: 'GET', isArray: true }
    });

    // Model factory
    var modelFactory = function modelFactory() {
        return Model.extend.apply(Model, arguments);
    };

    // export
    modelFactory.Model = Model;

    // export to Vue
    modelFactory.install = function (Vue) {
        // override set
        ModelBase.prototype.$set = function (key, val) {
            // ignore array
            if (Array.isArray(this)) {
                this[key] = val;

                return;
            }

            var isResolvedKey = key === '$resolved';

            // reset property
            if (isResolvedKey && this.__ob__) {
                var dp = Object.getOwnPropertyDescriptor(this, key);

                if (!dp.get && dp.configurable) {
                    delete this[key];
                }
            }

            // set reactive property
            Vue.set(this, key, val);

            // disable enumerable
            if (isResolvedKey) {
                var _dp = Object.getOwnPropertyDescriptor(this, key);

                if (_dp.enumerable) {
                    _dp.enumerable = false;

                    Object.defineProperty(this, key, _dp);
                }
            }
        };

        Vue.modelFactory = modelFactory;
        Vue.http = Model.http;
    };

    if (typeof Vue !== 'undefined') {
        Vue.use(modelFactory);
    }

    module.exports = modelFactory;
});