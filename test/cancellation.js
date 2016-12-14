require('chai').should();

const Promise = require('bluebird');

// config Bluebird
Promise.config({
    cancellation: true
});

const Model = require('..');

describe('Cancellation', () => {
    it('cancel a request', (done) => {
        let promise = Model.query().$promise;

        promise.isCancelled.should.to.be.a('function');

        promise.then(() => {
            // on Fulfilled
            throw new Error('Can not resolve');
        })
        .catch(() => {
            // on Rejected
            throw new Error('Can not reject');
        })
        .finally(() => {
            promise.isCancelled().should.to.be.true;

            done();
        });

        // cancel request
        promise.cancel();
    });
});
