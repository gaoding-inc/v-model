## V-Model

V-Model is a plugin for Vue.js, like ng-resource.
based on based on axios, path-to-regexp, and bluebird.

The V-Model provides interaction support with RESTful services, can work with Vue.js 1.x and 2.x.

See more about [ng-resource](https://docs.angularjs.org/api/ngResource/service/$resource)

## Installation

```
> npm i -S v-model
```

```javascript
Vue.use(require('v-model'));
```

## Usage

```javascript
// ./models/post.js
import Model from 'v-model';

export default Model('/posts/:id', {
    publish: { method: 'POST' }
}, {
    EDITING: 0,
    PUBLISHED: 1
});
```

```javascript
// app.js
import Model from 'v-model';

// install plugin
Vue.use(Model);

import PostModel from './models/post';

const app = new Vue({
    el: '#app',
    data: {
        post: new PostModel({
            status: PostModel.EDITING,
            content: '',
            title: ''
        })
    },
    methods: {
        load(id) {
            this.post = PostModel.get({
                id: id
            });

            return this.post.$promise;
        },
        save() {
            return this.post.$save();
        }
    }
});

```

## Model Factory

Before you can create models, you need to generate a Model.

```javascript
const PostModel = Model(url, actions, staticProps, options);
```

#### url

An Express-style path string, such as `/posts/:id`.

#### actions

Hash with declaration of custom actions.

```
{
    action1: {method:?, params:?, isArray:?, headers:?, ...},
    action2: {method:?, params:?, isArray:?, hasPagination:?, ...}
}
```

Default actions:

```
{
    get: { method: 'GET' },
    save: { method: 'POST' },
    update: { method: 'PUT' },
    delete: { method: 'DELETE' },
    query: { method: 'GET', isArray:true }
};
```

Where:

- `action` {String} The name of action.
- `method` {String} Case insensitive HTTP method (e.g. GET, POST, PUT, DELETE, JSONP, etc).
- `params` {Object} Optional set of pre-bound parameters for this action.
- `headers` {Object} Optional set of pre-bound request headers for this action.
- `timeout` {Number} timeout in milliseconds.
- `isArray` {Boolean} If true then the returned object for this action is an array.
- `hasPagination` {Boolean} Only work with `isArray: true`, if true then tranform the request result to `{items: requestResult, pagination: {num: ?, size: ?, total: ?}}`


#### staticProps

Hash with declaration of static properties.

```
const PostModel = Model('/posts/:id', null, {
    EDITING: 0,
    PUBLISHED: 1
});
```

#### options

Set http request default settings for.

Where:

- `baseURL` will be prepended to `url` unless `url` is absolute.
- `headers` are custom headers to be sent

See more [axios config](https://github.com/mzabriskie/axios#request-config)


## API

With static method:

```javascript
// get single post
const post = PostModel.get({
    id: 1
});

// get post list
const post = PostModel.query({
    status: PostModel.PUBLISHED
});

// update
const post = PostModel.update({
    id: 1,
    title: 'New post title'
});

// delete
PostModel.delete({
    id: 1
});
```

With instance method:

```javascript
// create/save
let post = new PostModel();
let promise = post.$save({
    title: 'Post title'
})

// update
let post = new PostModel({
    id: 1,
    title: 'Post title'
});
let promise = post.$update({
    title: 'New post title'
});
```

## Pagination

V-Model support pagination via reponse headers `X-Pagination`.

Some http request:

```
> GET /posts?page_num=1&page_size=20 HTTP/1.1
> Host: api.laoshu133.com
> User-Agent: curl/7.49.1
>
< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< X-Pagination: {"num":1,"size":20,"total":44}

[{"id":1,"title":"Post title","content":"content..."}]
```

Usage:

```javascript
const PostModel = Model('/posts/:id', {
    query: { method: 'get', isArray: true, hasPagination: true }
});

let postsData = PostModel.query({
    page_size: 20,
    page_num: 1
});

postsData.$promise.then(data => {
    console.log(data === postsData); // true
    console.log(postsData); // { "pagination":{"num":1,"size":20,"total":44}, "items": [...]}
});
```

## Interceptors

You can intercept requests or responses.

```
// global interceptor
const http = PostModel.http;

// request
http.interceptors.request.use(beforeSend, requestError);

// response
http.interceptors.response.use(afterSend, responseError);
```

See more [axios Interceptors](https://github.com/mzabriskie/axios#interceptors)


## Running tests

```
> npm test
```

## License

MIT
