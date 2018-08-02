import express from 'express';

export default (parentRouter, services, config) => {
    const router = express.Router();

    parentRouter.use('/posts', router);

    return router;
}