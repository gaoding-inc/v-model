require('chai').should();

// baseURL
const baseURL = 'http://api.laoshu133.com';

const nock = require('nock');

const Model = require('..');

// set Model baseURL
Model.http.baseURL = baseURL;

describe('Model actions', () => {
    const server = nock(baseURL);

    before(() => {
        nock.recorder.rec();

        server.get('/posts/1').reply(200, {
            id: 1,
            title: 'Post title'
        });
    });

    it('static method', () => {
        const PostModel = Model.extend('/posts/:id');

        let promise = PostModel.get({
            id: 1
        })
        .$promise;

        return promise.then(model => {
            model.title.should.to.be.equal('Post title');
        });
    });
});
