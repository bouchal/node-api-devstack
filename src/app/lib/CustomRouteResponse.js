import RouteResponse from '../../lib/responses/RouteResponse';

/**
 * Example how custom route response should look.
 *
 * Here we send custom header in response.
 */
export default class CustomRouteResponse extends RouteResponse {
    sendToResponse(res) {
        res.set('X-Powered-By', 'Love To Code');
        super.sendToResponse(res);
    }
}