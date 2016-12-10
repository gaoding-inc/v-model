require('chai').should();

// baseURL
const baseURL = 'http://api.laoshu133.com';

const nock = require('nock');

const Model = require('..');

// set Model baseURL
Model.http.defaults.baseURL = baseURL;

describe('Model actions', () => {
    const server = nock(baseURL).persist();

    const PostModel = Model.extend('/posts/:id', {
        query: {
            method: 'get',
            hasPagination: true
        }
    });

    before(() => {
        const posts = [
            { id: 1, title: 'Post title' },
            { id: 2, title: 'Post title 2' },
            { id: 3, title: 'Post title 3' }
        ];

        server.get('/posts?page_num=2&page_size=2')
        .reply(200, posts, {
            'X-Pagination': JSON.stringify({
                total: 3,
                size: 2,
                num: 1
            })
        });

        server.get('/posts/1').reply(200, posts[0]);

        server.post('/posts').reply(200, (uri, body) => {
            body = JSON.parse(body);

            body.id = 1;

            return body;
        });

        server.put('/posts/1').reply(200, (uri, body) => {
            return JSON.parse(body);
        });

        server.delete('/posts/1').reply(200, {
            id: 1
        });

        server.get('/tags').reply(200, [
            { id: 1, name: 'Tag 1' },
            { id: 2, name: 'Tag 2' }
        ]);
    });

    it('Model get', () => {
        return PostModel.get({
            id: 1
        })
        .$promise
        .then(post => {
            post.title.should.to.be.equal('Post title');
        });
    });

    it('Model instance get', () => {
        let post = new PostModel();

        return post.$get({
            id: 1
        })
        .then(() => {
            post.title.should.to.be.equal('Post title');
        })
        .then(() => {
            // reset
            post.id = 1;
            post.title = '';

            return post.$get();
        })
        .then(() => {
            post.title.should.to.be.equal('Post title');
        });
    });

    it('Model save', () => {
        return PostModel.save({
            title: 'Post title'
        })
        .$promise
        .then(post => {
            post.id.should.to.be.equal(1);
        });
    });

    it('Model instance save', () => {
        let post = new PostModel({
            title: 'Post title'
        });

        return post.$save()
        .then(() => {
            post.id.should.to.be.equal(1);
        });
    });

    it('Model update', () => {
        return PostModel.update({
            id: 1,
            title: 'New post title'
        })
        .$promise
        .then(post => {
            post.title.should.to.be.equal('New post title');
        });
    });

    it('Model instance update', () => {
        let post = new PostModel({
            id: 1
        });

        return post.$update({
            title: 'New post title'
        })
        .then(() => {
            post.title.should.to.be.equal('New post title');
        });
    });

    it('Model delete', () => {
        return PostModel.delete({
            id: 1
        })
        .$promise;
    });

    it('Model instance delete', () => {
        let post = new PostModel({
            id: 1
        });

        return post.$delete();
    });

    it('Model query with pagination', () => {
        return PostModel.query({
            page_num: 2,
            page_size: 2
        })
        .$promise
        .then(postsData => {
            postsData.pagination.should.to.be.an('object');
            postsData.items.should.to.be.an('array');
        });;
    });

    it('Model query without pagination', () => {
        const TagModel = Model.extend('/tags');

        return TagModel.query()
        .$promise
        .then(tags => {
            tags.should.to.be.an('array');
        });;
    });
});
