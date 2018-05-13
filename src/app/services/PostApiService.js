import JsonRequest from 'async-json-request';

class SimplePostService {
    constructor(services, config) {
        this._api = new JsonRequest(config.api.posts);
    }

    getPostData(postId) {
        return this._api.get(postId);
    }
}

export default SimplePostService