import express from 'express';
import Ajv from 'ajv';
import requireDir from 'require-dir';

const routes = requireDir(__dirname + '/../app/routes');

const ajv = new Ajv({coerceTypes: true})

const initRoute = (app, route) => {
    const validate = ajv.compile(route.getSchema());

    app[route.getMethod().toLowerCase()](route.getPath(), async(req, res) => {
        const data = req.data || req.query;
        if (!validate(data)) {
            return res.json({
                success: false,
                error: {
                    message: 'Input data are wrong or missing',
                    code: 'INPUT_VALIDATION_ERROR',
                    data: {errors: validate.errors, schema: schema},
                }
            });
        }

        try {
            res.json({
                success: true,
                data: await route.requestHandler(data)
            });
        } catch (e) {
            return res.json({
                success: false,
                error: e.toString()
            });
        }
    });
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