import AbstractRoute from '../../lib/AbstractRoute';

class PostData extends AbstractRoute {
    constructor(services, config) {
        super();

        this._postApiService = services.PostApiService;
    }

    getMethod() {
        return 'GET';
    }

    getPath() {
        return '/0/post';
    }

    getSchema() {
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

    requestHandler({postId}) {
        return this._postApiService.getPostData(postId);
    }
}

module.exports = PostData;