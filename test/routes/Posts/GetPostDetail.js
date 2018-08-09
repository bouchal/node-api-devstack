import routeTester from '../../../src/lib/routeTester';
import assert from 'assert';

import GetPostDetail from '../../../src/app/routes/Posts/detail/GetPostDetail';
import services from './mock/services';
import expected from './mock/data/postDetail';

const route = new GetPostDetail(services);

describe('Route ' + route.getName(), function () {
    it('should return correct list data', routeTester(route, {}, async function (res) {
        assert.equal(res.statusCode, 200, 'Wrong response status code');

        const data = JSON.parse(res._getData());
        assert.deepEqual(data, expected, 'Wrong data response');
    }));
});