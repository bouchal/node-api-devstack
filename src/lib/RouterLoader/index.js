import fs from 'fs';
import Ajv from 'ajv';

import AbstractRoute from '../AbstractRoute';
import RoutesLoaderException from './RoutesLoaderException';
import ErrorModel from "../ErrorModel";
import WrongInputResponse from "../responses/WrongInputResponse";
import RouteResponse from "../responses/RouteResponse";
import RouteResponseError from "./RouteResponseError";
import ServerErrorResponse from "../responses/ServerErrorResponse";


const ajv = new Ajv({coerceTypes: true});

export default class RouterLoader {
    constructor(services, config) {
        this._services = services;
        this._config = config;
    }

    /**
     * Append router passed in parameter by routes defined in specific directory.
     *
     * @param parentRouter
     * @param dirPath
     * @param recursive
     * @return {*}
     */
    appendRoutesFromDir(parentRouter, dirPath, {
        recursive = true
    } = {}) {
        /**
         * Getting Dirs and Files from directory because we wanna files load as routes and apply same process
         * to subdirectories if recursive is on.
         */
        const dirs = [];
        const files = [];

        const dirItems = fs.readdirSync(dirPath);

        dirItems.forEach((item) => {
            const fullPath = dirPath + '/' + item;

            fs.statSync(fullPath).isDirectory()
                ? dirs.push(fullPath)
                : files.push(fullPath);
        });

        /**
         * Get router for appending by routes.
         * You can have decorate router in 'index.js' of each directory with exporting function, which expected
         * parent router as first parameter.
         */
        const router = this._getCustomRouterFromDir(parentRouter, dirPath) || parentRouter;

        /**
         * When we initialize each route, we wanna skipp this 'index.js', because there is not route, but router
         * decorator.
         */
        const dirRequireResolve = this._getDirResolver(dirPath);

        files.forEach((filePath) => {
            /**
             * We wanna skip index.js etc.
             */
            if (dirRequireResolve === filePath) {
                return;
            }

            // Load route definition
            const route = this._getRouteInstanceByPath(filePath);

            this._initRouteToRouter(router, route);
        });

        if (!recursive) {
            return router;
        }

        dirs.forEach((dirPath) => {
            this.appendRoutesFromDir(router, dirPath, { recursive });
        });

        return router;
    }

    _getDirResolver(dirPath) {
        try {
            return require.resolve(dirPath);
        } catch (e) {
            return null;
        }
    }

    /**
     * Add instance of Abstract route to router.
     *
     * @param router
     * @param {AbstractRoute} route
     * @private
     */
    _initRouteToRouter(router, route) {
        const method = route.getMethod().toLowerCase();

        router[method](route.getPath(), this._getRouteMiddlewareArray(route), this._getRouteHandler(route));
    }

    /**
     * Return instance from index.js of Dir.
     * It should be always instance of Express router.
     *
     * Return null if required file (mostly index.js) don't exist.
     *
     * @param parentRouter
     * @param dirPath
     * @return {*}
     * @private
     */
    _getCustomRouterFromDir(parentRouter, dirPath) {
        try {
            const routerFactory = require(dirPath);
            const routerInitializer = routerFactory.default || routerFactory;

            return routerInitializer(parentRouter, this._services, this._config);
        } catch (e) {
            return null;
        }
    }

    /**
     * Require Route from file path.
     * It should be class extended AbstractRoute.
     *
     * @param routePath
     * @private
     */
    _getRouteInstanceByPath(routePath) {
        const Route = require(routePath);
        const RouteInitializer = Route.default || Route;

        const RouteInstance = new RouteInitializer(this._services, this._config);

        if (!(RouteInstance instanceof AbstractRoute)) {
            throw new RoutesLoaderException('Route "' + routePath + "' is not instance of AbstractRoute");
        }

        return RouteInstance;
    }

    /**
     * Return all middleware created to each route.
     *
     * @param route
     * @return {[*]}
     */
    _getRouteMiddlewareArray(route) {
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

            middlewareArray.push(this._getValidationMiddleware(getDataFromRequest, dataSchema, 'DATA'));
        }

        if (querySchema) {
            const getQueryFromRequest = (req) => {
                return req.query;
            };

            middlewareArray.push(this._getValidationMiddleware(getQueryFromRequest, querySchema, 'QUERY'));
        }

        if (parametersSchema) {
            const getParametersFromRequest = (req) => {
                return req.params;
            };

            middlewareArray.push(this._getValidationMiddleware(getParametersFromRequest, parametersSchema, 'PARAMETERS'));
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
    _getValidationMiddleware(requestGetterValue, schema, sectionName) {
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
    _getRouteHandler(route) {
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
}