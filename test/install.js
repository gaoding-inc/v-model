require('chai').should();

const Vue = require('vue');
const Model = require('..');

describe('Plugin install', () => {
    before(() => {
        Vue.use(Model);
    });

    it('install plugin', () => {
        Vue.Model.should.to.equal(Model);
        Vue.http.should.to.equal(Model.http);
    });

    it('reactive property', () => {
        const app = new Vue({
            data() {
                return {
                    model: new Model({
                        foo: 1
                    })
                };
            }
        });

        const dp = Object.getOwnPropertyDescriptor(app.model, 'foo');

        dp.get.should.to.be.a('function');
    });
});
