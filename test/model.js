require('chai').should();

const Model = require('../lib/model');

describe('Model', () => {
    it('Model default actions', () => {
        Model.get.should.to.be.a('function');
        Model.save.should.to.be.a('function');
        Model.update.should.to.be.a('function');
        Model.query.should.to.be.a('function');
    });

    it('Model instance default actions', () => {
        const model = new Model();

        model.$get.should.to.be.a('function');
        model.$save.should.to.be.a('function');
        model.$update.should.to.be.a('function');
        model.$query.should.to.be.a('function');
    });
});
