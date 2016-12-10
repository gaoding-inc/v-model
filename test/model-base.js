require('chai').should();

const ModelBase = require('../lib/model-base');

describe('Model base', () => {
    it('extend model', () => {
        const PostModel = ModelBase.extend('/posts/:id');

        PostModel.extend.should.to.be.a('function');
        PostModel.addAction.should.to.be.a('function');
    });

    it('add actions', () => {
        const PostModel = ModelBase.extend('/posts/:id', {
            save: { method: 'POST' }
        });

        PostModel.save.should.to.be.a('function');
        PostModel.prototype.$save.should.to.be.a('function');
    });

    it('add static props', () => {
        const PostModel = ModelBase.extend('/posts/:id', null, {
            EDITING: 0,
            PUBLISHED: 1
        });

        PostModel.EDITING.should.to.be.equal(0);
        PostModel.PUBLISHED.should.to.be.equal(1);
    });

    it('model url', () => {
        const PostModel = ModelBase.extend('/posts/:id');

        PostModel.url().should.to.be.equal('/posts');

        PostModel.url({
            id: 1
        })
        .should.to.be.equal('/posts/1');

        PostModel.url({
            status: 1
        })
        .should.to.be.equal('/posts');
    });

    it('create model', () => {
        const PostModel = ModelBase.extend('/posts/:id', {
            save: { method: 'POST' }
        });

        const post = new PostModel();

        (post instanceof ModelBase).should.to.be.true;

        post.$save.should.to.be.a('function');
    });
});
