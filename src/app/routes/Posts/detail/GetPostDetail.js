import ConsoleLogRoute from '../../../lib/ConsoleLogRoute';
import CustomRouteResponse from '../../../lib/CustomRouteResponse';

class GetPostDetail extends ConsoleLogRoute {
    constructor(services, config) {
        super();

        this._postApiService = services.PostApiService;
    }

    getMethod() {
        return 'GET';
    }

    getPath() {
        return '/:postId';
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

    getFullPath() {
        return '/v0/posts' + this.getPath();
    }

    async requestHandler(req, res) {
        const data = await this._postApiService.getPostData(req.params.postId);

        return new CustomRouteResponse(data);
    }
}

module.exports = GetPostDetail;