import RouteResponse from './RouteResponse';
import ErrorModel from '../ErrorModel';

export default class ErrorsResponse extends RouteResponse {
    constructor(errors, code = 500) {
        if (!Array.isArray(errors)) {
            throw new Error('Errors should be an array');
        }

        errors.forEach((error) => {
            if (!(error instanceof ErrorModel)) {
                throw new Error('All items in response errors should be descendant of ErrorModel. '
                    + (typeof error) + ' given.');
            }
        });

        const errorJsons = errors.map((i) => {
            return i.toJson();
        });

        super({ errors: errorJsons }, code);
    }
}