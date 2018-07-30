export default class RouteResponse {
    constructor(body, code = 200) {
        this._body = body;
        this._code = code;
    }

    get body() {
        return this._body;
    }

    get code() {
        return this._code;
    }

    /**
     * Sent response to response object passed from express.
     *
     * @param res
     */
    sendToResponse(res) {
        res
            .status(this.code)
            .json(this.body);
    }
}
