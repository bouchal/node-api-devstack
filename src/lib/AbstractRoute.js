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
     * In case, that route is added to some router with prefix, we can override this method to return
     * actual full path.
     *
     * @return {string}
     */
    getFullPath() {
        return this.getPath();
    }

    /**
     * Return JSON schema for validation input data in body of request.
     * If it return NULL, input validation is disabled.
     * You can't use it for GET.
     */
    getDataSchema() {
        return null;
    }

    /**
     * Return JSON schema for validation input data in query of request.
     * If it return NULL, input val
     */
    getQuerySchema() {
        return null;
    }

    /**
     * Return JSON schema for validation input data in query of request.
     * If it return NULL, input val
     */
    getParametersSchema() {
        return null
    }

    /**
     * Handle Request
     *
     * @param req
     * @param res
     */
    requestHandler(req, res) {
        throw new TypeError("You must override method 'requestHandler' in your route.");
    }

    /**
     * Return express middleware or array with multiple middleware functions which is called right before
     * request handler. It means, that this middleware is called after input validation.
     *
     * If you return null, middleware will be ignored.
     *
     * @returns {null|function|array}
     */
    getMiddleware() {
        return null;
    }

    /**
     * Return express middleware or array with multiple middleware functions which is called right after
     * endpoint is called. It means, that this middleware is called before input validation.
     *
     * If you return null, middleware will be ignored.
     *
     * @return {null}
     */
    getPreMiddleware() {
        return null;
    }

    /**
     * Return name of route merging method and path
     *
     * e.g. POST /0/test
     *
     * @return {string}
     */
    getName() {
        return this.getMethod().toUpperCase() + ' ' + this.getFullPath();
    }
}