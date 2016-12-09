require('chai').should();

const VModel = require('../lib');

describe('create model', () => {
    const PostModel = VModel('/posts/:id', {
        publish: { method: 'POST' }
    }, {
        EDITING: 0,
        PUBLISHED: 1
    });

    let post;

    beforeEach(() => {
        post = new PostModel();
    });

    it('model should instanceof Model', () => {
        (post instanceof PostModel).should.to.be.true;
        (post instanceof VModel.Model).should.to.be.true;
    });

    it('check default actions', () => {
        PostModel.get.should.to.be.a('function');
        PostModel.save.should.to.be.a('function');
        PostModel.update.should.to.be.a('function');
        PostModel.query.should.to.be.a('function');
        PostModel.publish.should.to.be.a('function');

        post.$get.should.to.be.a('function');
        post.$save.should.to.be.a('function');
        post.$update.should.to.be.a('function');
        post.$query.should.to.be.a('function');
        post.$publish.should.to.be.a('function');
    });

    it('check staic props', () => {
        PostModel.EDITING.should.to.be.equal(0);
        PostModel.PUBLISHED.should.to.be.equal(1);
    });

    it('check inherit', () => {
        const SubPostModel = PostModel.extend('/sub/posts/:id');

        // static props
        SubPostModel.PUBLISHED.should.to.be.equal(1);

        // static methods
        SubPostModel.publish.should.to.be.a('function');

        // instance
        let subPost = new SubPostModel();

        (subPost instanceof PostModel).should.to.be.true;
        (subPost instanceof VModel.Model).should.to.be.true;

        subPost.$publish.should.to.be.a('function');
    });
});