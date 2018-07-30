import AbstractRoute from '../../lib/AbstractRoute';
import RouteReponse from '../../lib/responses/RouteResponse';

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

    getPreMiddleware() {
        const touchMiddleware = (req, res, next) => {
            console.log('Touching endpoint ' + this.getName());
            next();
        };

        return touchMiddleware;
    }

    getMiddleware() {
        const logMiddleware = (req, res, next) => {
            const postId = req.params.postId;
            console.log('Request for getting data of post with ID: ' + postId);
            next();
        };

        return [logMiddleware]
    }

    async requestHandler(req, res) {
        const data = await this._postApiService.getPostData(req.params.postId);

        return new RouteReponse(data);
    }
}

module.exports = PostData;