import express from 'express';
import Ajv from 'ajv';
import requireDir from 'require-dir';
import ErrorModel from './ErrorModel';
import RouteResponse from './responses/RouteResponse';
import RouteResponseError from './RouteResponseError';
import ServerErrorResponse from './responses/ServerErrorResponse';
import WrongInputResponse from './responses/WrongInputResponse';

const routes = requireDir(__dirname + '/../app/routes');
const ajv = new Ajv({coerceTypes: true});

/**
 * Route initialization and adding it to app.
 *
 * Before function call routeHandler it create multiple middleware for validation
 * or specific route definition middleware.
 *
 * @param app
 * @param route
 */
const initRoute = (app, route) => {
    const method = route.getMethod().toLowerCase();

    app[method](route.getPath(), getRouteMiddlewareArray(route), getRouteHandler(route));
};


/**
 * Return all middleware created to each route.
 *
 * @param route
 * @return {[*]}
 */
const getRouteMiddlewareArray = (route) => {
    const routePreMiddleware = route.getPreMiddleware() || [];
    const routeMiddleware = route.getMiddleware() || [];

    const middlewareArray = [
        ...(Array.isArray(routePreMiddleware) ? routePreMiddleware : [ routePreMiddleware ])
    ];

    const dataSchema = route.getDataSchema();
    const querySchema = route.getQuerySchema();
    const parametersSchema = route.getParametersSchema();

    if (dataSchema) {
        const getDataFromRequest = (req) => {
            return req.data;
        };

        middlewareArray.push(getValidationMiddleware(getDataFromRequest, dataSchema, 'DATA'));
    }

    if (querySchema) {
        const getQueryFromRequest = (req) => {
            return req.query;
        };

        middlewareArray.push(getValidationMiddleware(getQueryFromRequest, querySchema, 'QUERY'));
    }

    if (parametersSchema) {
        const getParametersFromRequest = (req) => {
            return req.params;
        };

        middlewareArray.push(getValidationMiddleware(getParametersFromRequest, parametersSchema, 'PARAMETERS'));
    }

    return [
        ...middlewareArray,
        ...(Array.isArray(routeMiddleware) ? routeMiddleware : [ routeMiddleware ])
    ];
};


/**
 * Create middleware for testing validation json schema.
 *
 * @param requestGetterValue
 * @param schema
 * @param sectionName
 * @return {function(*=, *=, *)}
 */
const getValidationMiddleware = (requestGetterValue, schema, sectionName) => {
    const validate = ajv.compile(schema);

    return (req, res, next) => {
        const data = requestGetterValue(req);

        if (!validate(data)) {
            const error = new ErrorModel(
                'INPUT_VALIDATION_ERROR',
                'Input data in ' + sectionName + ' section are wrong or missing',
                {errors: validate.errors, schema: schema}
            );

            new WrongInputResponse(error).sendToResponse(res);
            return;
        }

        next();
    }
};


/**
 * Common handler for route.
 * it's called for every route and handle all necessary things before it's passed to handlers of each specific routes.
 *
 * @param route
 */
const getRouteHandler = (route) => {
    return async (req, res) => {
        try {
            const response = await route.requestHandler(req, res);

            if (!(response instanceof RouteResponse)) {
                throw new RouteResponseError('Method "requestHandler" in route "' + route.getName() +
                    '" should return descendant of "RouteResponse". ' + + (typeof response) + ' given.');
            }

            return response.sendToResponse(res);
        } catch (e) {
            new ServerErrorResponse(e).sendToResponse(res);
        }
    }
};

export default (services, config) => {
    const router = express.Router();

    for (const routeName in routes) {
        if (!routes.hasOwnProperty(routeName)) {
            continue;
        }

        const RouteInitializer = routes[routeName].default || routes[routeName];
        initRoute(router, new RouteInitializer(services, config));
    }

    return router;
}