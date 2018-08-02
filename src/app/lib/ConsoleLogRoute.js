import AbstractRoute from '../../lib/AbstractRoute';

/**
 * Here we prepare abstract route for printing their calling to console through middleware.
 */
export default class ConsoleLogRoute extends AbstractRoute {
    /**
     * This middleware is called before schema validation.
     */
    getPreMiddleware() {
        const touchMiddleware = (req, res, next) => {
            console.log('Route middleware before schema validation');
            next();
        };

        return touchMiddleware;
    }

    /**
     * This middleware is called after schema validation right before route handler.
     * Notice, that you can return even array with multiple middleware.
     */
    getMiddleware() {
        const logMiddleware = (req, res, next) => {
            console.log('Route middleware after schema validation');
            next();
        };

        return [logMiddleware]
    }
}