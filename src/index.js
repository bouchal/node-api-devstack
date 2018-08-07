/**
 * In newer version of node unhandled promise rejections will throw Error and end up application.
 * So this is the Future and don't remove it!
 */
process.on('unhandledRejection', up => {
    throw up
});

import main from './app';

main();