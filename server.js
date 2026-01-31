/**
 * Imports
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import MVC Components
import routes from './src/controllers/routes.js';
import { addLocalVariables } from './src/middleware/global.js';
import {catchAll, globalErrorHandler} from './src/controllers/error-handlers.js';
// import { addLocalVariables, reloadBrowser } from './src/middleware/global.js';

/**
 * Configuration Variables
 */
const NODE_ENV = process.env.NODE_ENV || 'production';
console.log(NODE_ENV);
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


// Auto reload browser when in development mode
// app.use(reloadBrowser);


/**
 * Start server on specified port
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})