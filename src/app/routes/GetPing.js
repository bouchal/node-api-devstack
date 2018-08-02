import ConsoleLogRouter from '../lib/ConsoleLogRoute';
import CustomRouteResponse from '../lib/CustomRouteResponse';

class GetPing extends ConsoleLogRouter {
    getMethod() {
        return 'GET';
    }

    getPath() {
        return '/ping';
    }

    async requestHandler(req, res) {
        return new CustomRouteResponse({
            data: 'pong'
        });
    }
}

module.exports = GetPing;