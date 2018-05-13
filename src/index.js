/**
 * In newer version of node unhandled promise rejections will throw Error and end up application.
 * So this is the Future and don't remove it!
 */
process.on('unhandledRejection', up => {
    throw up
});

import express from 'express';
import kontik from 'kontik';

import routerFactory from "./lib/routerFactory";
import config from "./app/config";

const services = kontik(config, {
    dir: __dirname + '/app/services'
});


const app = express();
const PORT = config.port;

app.use(routerFactory(services, config));

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
