/**
 * Model
 *
 * @author xiaomi
 */

import ModelBase from './model-base';

// Model
const Model = ModelBase.extend('', {
    get: { method: 'GET' },
    save: { method: 'POST' },
    update: { method: 'PUT' },
    delete: { method: 'DELETE' },
    query: { method: 'GET', isArray: true }
});

export default Model;
