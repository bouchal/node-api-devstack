/**
 * In newer version of node unhandled promise rejections will throw Error and end up application.
 * So this is the Future and don't remove it!
 */
process.on('unhandledRejection', up => {
    throw up
});

import express from 'express';
import kontik from 'kontik';

import RouterLoader from './lib/RouterLoader';
import config from "./app/config";

const serviceDir = __dirname + '/app/services';
const routesDir = __dirname + '/app/routes';

const services = kontik(config, {
    dir: serviceDir
});


const app = express();
const PORT = config.port;

const routerLoader = new RouterLoader(services, config);
routerLoader.appendRoutesFromDir(app, routesDir);

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
