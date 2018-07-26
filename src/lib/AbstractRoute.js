export default class AbstractRoute {
    /**
     * Return route method type (GET, POST etc.)
     *
     * @returns {string}
     */
    getMethod() {
        throw new TypeError("You must override method 'getMethod' in your route.");
    }

    /**
     * Return route public path.
     *
     * @returns {string}
     */
    getPath() {
        throw new TypeError("You must override method 'getPath' in your route.");
    }

    /**
     * Return JSON schema for validation input data of request.
     */
    getSchema() {
        throw new TypeError("You must override method 'getSchema' in your route.");
    }

    /**
     * Handle request
     *
     * @param data
     */
    requestHandler(data) {
        throw new TypeError("You must override method 'getRequestHandler' in your route.");
    }

    /**
     * Route Middleware
     *
     * @param req
     * @param res
     * @param next
     */
    middleware(req, res, next) {
        next();
    }
}