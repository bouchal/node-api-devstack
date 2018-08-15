import express from 'express';
import configLoader from 'environmentconfig';
import kontik from "kontik";
import bodyParser from 'body-parser';
import RouterLoader from "../lib/RouterLoader";

const getConfig = () => {
    return configLoader({
        dir: __dirname + '/config',
    });
};

const getServices = (config) => {
    return kontik(config, {
        dir: __dirname + '/services'
    });
};


const routerLoader = (app, services, config) => {
    const routerLoader = new RouterLoader(services, config);
    routerLoader.appendRoutesFromDir(app, __dirname + '/routes');
};

const main = async () => {
    const app = express();

    app.use(bodyParser.json());

    const config = getConfig();
    const services = getServices(config);

    routerLoader(app, services, config);

    const PORT = config.port;

    app.listen(PORT, () => {
        console.log('Listening on port ' + PORT);
    });
};

export default main;
