import ConsoleLogRoute from '../../lib/ConsoleLogRoute'
import CustomRouteResponse from '../../lib/CustomRouteResponse';

class GetPostsList extends ConsoleLogRoute {
    constructor(services, config) {
        super();

        this._postApiService = services.PostApiService;
    }

    getMethod() {
        return 'GET';
    }

    getPath() {
        return '';
    }

    async requestHandler(req, res) {
        const data = await this._postApiService.getPostList();

        return new CustomRouteResponse(data);
    }
}

module.exports = GetPostsList;