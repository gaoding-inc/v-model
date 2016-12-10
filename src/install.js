/**
 * Vue.js plugin support
 *
 * @author xiaomi
 */

import Model from './model';
import ModelBase from './model-base';

export default function install(Vue) {
    // override set to support reactive property
    ModelBase.prototype.$set = function(key, val) {
        // ignore array
        if(Array.isArray(this)) {
            this[key] = val;

            return;
        }

        const isResolvedKey = key === '$resolved';

        // reset property
        if(isResolvedKey && this.__ob__) {
            let dp = Object.getOwnPropertyDescriptor(this, key);

            if(dp && !dp.get && dp.configurable) {
                delete this[key];
            }
        }

        // set reactive property
        Vue.set(this, key, val);

        // disable property enumerable
        if(isResolvedKey) {
            let dp = Object.getOwnPropertyDescriptor(this, key);

            if(dp && dp.enumerable) {
                dp.enumerable = false;

                Object.defineProperty(this, key, dp);
            }
        }
    };

    // export
    Vue.http = ModelBase.http;
    Vue.Model = Model;
};
