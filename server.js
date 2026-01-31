/**
 * Imports
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const NODE_ENV = process.env.NODE_ENV || 'production';
// Import MVC Components
import routes from './src/controllers/routes.js';
import {catchAll, globalErrorHandler} from './src/controllers/error-handlers.js';
import { addLocalVariables } from './src/middleware/global.js';

/**
 * Configuration Variables
 */
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup the Express Server
const app = express();


/**
 * Express Middleware
 */

// Static file settings
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));


/**
 * Global middleware
 */
app.use(addLocalVariables);

// Routes
app.use('/', routes);


// Error handling
app.use(catchAll);
app.use(globalErrorHandler);



/**
 * Start WebSocket Server in Development Mode; used for live reloading
 */
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');
    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });
        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });
        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

/**
 * Start server on specified port
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})