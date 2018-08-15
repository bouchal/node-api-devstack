Empty API ES6 DevStack with simple example for creating EP.

## Goal and The Idea Behind

Goal of this project is that we can only with fork of it, config new API EP and in few minutes prepare it to production, 
because DevStack has all needed stuff inside.

As many frameworks and DevStack you should be capable create functionality isolate from core code. Thanks to that
you can upgrade packages separately from you code and stay up to date.

## What's inside?

Folder structure looks like this:

```
├── src
│   ├── app
│   │   ├── config
│   │   ├── routes
│   │   └── services
│   └── lib
└── test
```

- __src__ - All source code containing ES6 syntax and you can use it of course in your code too.
  - __lib__ - Core functionality of dev stack and you should not touch it, if you want to keep backward compatibility.
  - __app__ - Main folder for your code
    - __config__ - Folder with config files which is loaded via package [environmentconfig](https://www.npmjs.com/package/environmentconfig).
    If you like to change config loading method, just do it in file */src/app/config.js*
    - __services__ - Folder with services singletons which is passed together with config to all routes definitions.
    Services is created via DI container package [kontik](https://www.npmjs.com/package/kontik).
    - __routes__ - Here is all routes loaded to express router. Every file should contain one route created by definition
    you can find bellow.
- __test__ - Here you can define all needed test. Everything is here ready for it. Just write `npm run test` to console.


## Routes definition

Every route should be defined in `/src/app/routes`. When every file is equivalent of one route.

So just create new JS file with class extended predefined `AbstractRoute` and it will be loaded automatically.

But you need to follow some rules. But if you don't, program will throw Errors and tell you what to do.

### What rules?

- Override method `getMethod` to return string with route method (`POST`, `GET` etc.)
- Override method `getPath` to return string with express path (e.g. `/0/post/:postId`)
- Override method `requestHandler` which is called after all middleware. And it must return instance of class
`RouteResponse` or it's descendant. You can find more at *Response* section bellow.

So new Route could looks like this:

```javascript
import AbstractRoute from '../../lib/AbstractRoute';
import RouteResponse from '../../lib/responses/RouteResponse';

export default class PostData extends AbstractRoute {
    getMethod() {
        return 'GET';
    }

    getPath() {
        return '/0/hello-world';
    }

    async requestHandler(req, res) {
        return await new RouteResponse({
            text: 'Hello world'
        });
    }
}
```

### Route functionality

As I mentioned above, all services and config is passed to route instance via constructor. So you can save them as
"private" variables and work with them in `requestHandler` method.

For example:

```javascript
import AbstractRoute from '../../lib/AbstractRoute';
import RouteResponse from '../../lib/responses/RouteResponse';

class PostData extends AbstractRoute {
    constructor(services, config) {
        super();

        this._postApiService = services.PostApiService;
    }

    getMethod() {
        return 'GET';
    }

    getPath() {
        return '/0/post/:postId';
    }

    async requestHandler(req, res) {
        const data = await this._postApiService.getPostData(req.params.postId);

        return new RouteResponse(data);
    }
}

module.exports = PostData;
```


### Route input validation

Microservices need to work with data and must process data which is passed to services via input.
For that is our routes prepared for passing validation JSON schemas directly in route definition.

You can again override scheme methods depends of what input you wanna validate. Each of this method should return 
JSON-schema definition. Details is in documentation here: http://json-schema.org

- __BODY__
  - It's data passed in request body when you send `POST` or `PUT` request (and some others).
  - *Method:* `getBodySchema`
- __PARAMETERS__
  - It's data passed in URI directly in path. For example: `/0/posts/:postId`, where `postId` is parameter.
  - *Method:* `getParametersSchema`
- __QUERY__
  - It's data passed in URI after question mark (`?`). For example: `/0/posts?access_token=token`, where `access_token`
  is parameter in query.
  - *Method:* `getQuerySchema`
  
For example:

```javascript
import AbstractRoute from '../../lib/AbstractRoute';
import RouteResponse from '../../lib/responses/RouteResponse';

class PostData extends AbstractRoute {
    constructor(services, config) {
        super();

        this._postApiService = services.PostApiService;
    }

    getMethod() {
        return 'GET';
    }

    getPath() {
        return '/0/post/:postId';
    }

    getParametersSchema() {
        return {
            type: 'object',
            properties: {
                postId: {
                    type: 'number'
                }
            },
            required: ['postId']
        }
    }

    async requestHandler(req, res) {
        const data = await this._postApiService.getPostData(req.params.postId);

        return new RouteResponse(data);
    }
}

module.exports = PostData;
```


### Route middleware

In route definition you can define one or multiple middleware which is called before request handler.

Again you can define them via overriding methods. In this case it's `getMiddleware` and `getPreMiddleware`.

Difference between them is that middleware defined in `getPreMiddleware` is called right after request touch server.
It's useful for example for authorization request, where even input validation response should be security issue.

Middleware defined in method `getMiddleware` is called after validation and right after that is called request handler. 

### Routes grouping

Many times you need to group routes. Simplest reason for that is just clear file structure. More complex
reason is that you need to apply more complex rules to routes in group via separated router which is 
use in parent router.

Our RouterLoader can help in both scenarios.

#### Route file structure

Loader is set for recursive loading on routes from each subdirectories in routes directory and also
their subdirectories.

You can create files with any name but except `index.js` etc. This file name is reserved for router
decorator which I will describe bellow.

So your route structure could looks like this:

```text
└── routes
    ├── Posts
    │   ├── Detail
    │   │   └-─ GetPostDetail.js
    │   └── GetPostsList.js
    └── GetPing.js
```

### Router decorator

In each directory of you routes structure, you can create `index.js` file which contain and exports only
one method, witch is used for router decorating and also it should return this same or some other express
router. To router will append every route in this directory. 

If you don't define new router or don't create `index.js` file, it will be use same router as in parent
directory.

You can use `config` and `service` variables in decorator as in routes definition.

Router decorator can looks like this:

```javascript
module.exports = (parentRouter, services, config) => {
    const router = express.Router();

    parentRouter.use('/0', router);

    return router;
};
```

And each route in this directory will have path prefix `/0`.

## Routes testing

For more convenient testing of route requests, you can use prepared function `routeTester`, which create mock request
and response and pass it to route request handler.

__For example:__

```javascript
import routeTester from '../../../src/lib/routeTester';

const mockServices = {
    UserService: {
        getUserData: (userId) => {
            return { id: userId, firstName: 'John', lastName: 'Doe' }
        }
    }
}

const mockConfig = { ... }

it('should return correct list data', routeTester(new GetUserRoute(mockServices, mockConfig), {}, async function (res) {
    assert.equal(res.statusCode, 200, 'Wrong response status code');

    const data = JSON.parse(res._getData());
    assert.deepEqual(data, expected, 'Wrong data response');
}));
```

### routeTester parameters:

- __route__
  - Instance of tested route. It should create with mock data in constructor.
- __request additional data__
  - In default request has set only 2 options `method` (from route method `getMethod`)
  and `url` (from route method `getFullPath`). This two can't be overridden. You can through this parameter pass other
  (like headers, authentication etc.)
- __test function__
  - this function should be async or return promise. It will get final response object as first parameter and you can
  do here all necessary testing stuff. 

## Responses

Every new route need to have method `requestHandler` which return promise and as it's resolver must be instance
of class `RouteResponse` or it's descendant.

You can create your own responses for some abstract programing, for unify some response groups or just for adding some
header or change response code.

Custom response need only one method and it's `sendToResponse(res)`. Only parameter passed to this method is Express
response object and through it you can send custom response as you want.

For example:

```javascript
export default class NotFoundResponse {
    sendToResponse(res) {
        res
            .status(404)
            .send('Item was not found.');
    }
}
```
