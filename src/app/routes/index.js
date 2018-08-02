import express from 'express';

/**
 * Router decorator.
 *
 * In each directory you can place 'index.js' with function, which is get parent router as parameter, use it, modify it,
 * and return as router to which will be all routes in directory or subdirectory placed.
 */
module.exports = (parentRouter, services, config) => {
    const router = express.Router();

    parentRouter.use('/0', router);

    return router;
};