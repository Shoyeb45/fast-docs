process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

import http from 'http';
import logger from './core/logger.js';
import { port } from './config.js';
import { app } from './app.js';
import { attachYjsWebSocket } from './ws/yjs-ws.js';

async function start() {
    try {
        logger.info('App loaded');
        const server = http.createServer(app);
        attachYjsWebSocket(server);
        server.listen(port, () => {
            logger.info(`Server running on port: ${port}`);
        });
    } catch (err) {
        logger.error('Startup error');
        logger.error(err);
        process.exit(1);
    }
}

start()
    .catch((err) => {
        logger.error('Fatal startup error.', err);
        process.exit(1);
    })
