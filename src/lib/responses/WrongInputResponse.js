import ErrorsResponse from './ErrorsResponse';

export default class WrongInputResponse extends ErrorsResponse {
    constructor(validationError) {
        super([ validationError ], 400);
    }
}