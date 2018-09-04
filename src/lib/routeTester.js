import httpMocks from 'node-mocks-http';
import events from 'events';

export default function (route, requestOptions, responseTestFn) {
    return function () {
        return new Promise(function (resolve, reject) {
            const req = httpMocks.createRequest({
                method: route.getMethod(),
                url: route.getFullPath(),
                ...requestOptions
            });

            const res = httpMocks.createResponse({
                eventEmitter: events.EventEmitter
            });

            res.on('end', function () {
                resolve(responseTestFn(res));
            });

            route.requestHandler(req, res).then((response) => {
                response.sendToResponse(res);
            }).catch(reject);
        });
    };
};