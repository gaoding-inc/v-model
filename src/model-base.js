/**
 * ModelBase
 *
 * @author xiaomi
 */

import axios from 'axios';
import forEach from 'lodash/forEach';
import clone from 'lodash/clone';
import assign from 'lodash/assign';
import Promise from 'bluebird';
import pathToRegexp from 'path-to-regexp';

const isArray = Array.isArray;
const rUpdateMethod = /^(POST|PUT|PATCH)$/i;

const defaultGetPagination = function(response) {
    const headers = response.headers;
    const key = 'x-pagination';

    let pagination = null;

    try {
        pagination = JSON.parse(headers[key]);
    }
    catch(ex) { }

    if(!pagination) {
        throw new Error(`${key} get/parse error`);
    }

    return pagination;
};

export default class ModelBase {
    static http = axios.create();

    constructor(data) {
        this.$defineResult();

        this.$reset(data);
    }

    $defineResult() {
        const innerProps = {
            promise: Promise.resolve(this),
            resolved: true,
            response: null
        };

        forEach(innerProps, (val, k) => {
            Object.defineProperty(this, '$' + k, {
                configurable: true,
                enumerable: false,
                writable: true,
                value: val
            });
        });
    }

    $reset(data) {
        forEach(this, (val, k) => {
            if(k !== '$resolved') {
                delete this[k];
            }
        });

        if(typeof data === 'object') {
            forEach(data, (val, k) => {
                this.$set(k, val);
            });
        }

        return this;
    }

    $set(key, val) {
        this[key] = val;
    }

    $request(options) {
        const Model = this.constructor;

        options = clone(options);

        // mixin params, data
        options.params = assign({}, Model.params, options.params);

        // all data for url
        const allData = assign({},
            options.params,
            options.data
        );

        // clear params
        forEach(Model.urlTokens, token => {
            if(token && token.name) {
                delete options.params[token.name];
            }
        });

        // wrap by bluebird
        // support Cancellation
        return new Promise((resolve, reject, onCancel) => {
            options = assign({
                url: Model.url(allData)
            }, Model.options, options);

            // clean
            if(!rUpdateMethod.test(options.method)) {
                delete options.data;
            }

            // cancellation
            if(typeof onCancel === 'function') {
                const source = axios.CancelToken.source();

                onCancel(() => {
                    source.cancel('Request canceled');
                });

                options.cancelToken = source.token;
            }

            return Model.http.request(options).then(resolve, reject);
        });
    }

    static extend(url, actions, staticProps, options) {
        const Model = class Model extends this {};

        const urlTokens = pathToRegexp.parse(url);

        // optional last token
        const urlLastToken = urlTokens[urlTokens.length - 1];
        if(typeof urlLastToken === 'object') {
            urlLastToken.optional = true;
        }

        Model.url = pathToRegexp.tokensToFunction(urlTokens);
        Model.urlTokens = urlTokens;
        Model.options = options;

        // staic props
        assign(Model, staticProps);

        // actions
        forEach(actions, (action, name) => {
            Model.addAction(name, action);
        });

        return Model;
    }

    static addAction(name, action) {
        const method = action.method;
        const hasPagination = action.hasPagination;
        const isArrayResult = !!(action.isArray || hasPagination);

        this.prototype['$' + name] = function(params) {
            const Model = this.constructor;
            let result;

            // update
            if(rUpdateMethod.test(method)) {
                forEach(params, (val, k) => {
                    this.$set(k, val);
                });

                result = Model[name](this);
            }
            else {
                result = Model[name](params, this);
            }

            return result.$promise;
        };

        this[name] = function(params, data) {
            const Model = this;

            // switch params
            if(rUpdateMethod.test(method)) {
                [data, params] = [params, data];
            }

            let model = data;
            if(!(model instanceof Model)) {
                model = new Model(data);
            }

            let result = model;

            if(isArrayResult) {
                result = hasPagination ? {
                    pagination: { total: 0, size: 20, num: 1 },
                    items: []
                } : [];

                model.$defineResult.call(result);
            }

            // mixin params
            params = assign({}, action.params, params);

            let options = assign({
                params: params,
                data: model
            }, action);

            let promise = model.$request(options)
            .then(response => {
                result.$response = response;

                let data = response.data;

                if(isArray(data) !== isArrayResult) {
                    throw new Error(`Model.${name} expected an ${isArrayResult ? 'array' : 'object'} but got an ${isArray(data) ? 'array' : 'object'}`);
                }

                if(!isArrayResult) {
                    return model.$reset(data);
                }

                let items = hasPagination ? result.items : result;

                // fill items
                data.forEach(item => {
                    items.push(new Model(item));
                });

                if(hasPagination) {
                    let getPagination = defaultGetPagination;
                    if(Model.options && Model.options.getPagination) {
                        getPagination = Model.options.getPagination;
                    }

                    let pagination = getPagination(response);
                    assign(result.pagination, pagination);
                }

                return result;
            })
            .finally(() => {
                model.$set.call(result, '$resolved', true);
            });

            model.$set.call(result, '$resolved', false);
            result.$promise = promise;

            return result;
        };
    }
}
