import ErrorsResponse from './ErrorsResponse';
import ErrorModel from '../ErrorModel';

export default class ServerErrorResponse extends ErrorsResponse {
    constructor(error) {
        if (!(error instanceof Error)) {
            throw new Error('Error passed to ServerErrorResponse constructor should be descendant of Error');
        }

        const errorModel = new ErrorModel(
            'SERVER_ERROR',
            error.message,
            error.stack
        );

        super([ errorModel ], 500);
    }
}