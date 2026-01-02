/**
 * Imports
 */
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Variables
 */
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup the Express Server
const app = express();
/**

 * Express Middleware
 */
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find the templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Global template variables middleware
 * 
 * Makes common variable available to all EJS templates
 * without having to pass them individually from each
 * route handler
 * 
 */
app.use((req, res, next) => {
    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = NODE_ENV.toLowerCase() || 'production';

    // Continue to the next middleware or route handler
    next();
})

/**
 * Auto reload browser
 * When in development mode, start a WebSocket server
 * for live reloading the browser
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
        console.error('Failed to start WebSocket server: ', error);
    }
}

/**
 * Routes
 */
app.get('/', (req, res) => {
    const title = 'Welcome Home';
    res.render('home', {title});
})

app.get('/about', (req, res) => {
    const title = 'About Me';
    res.render('about', {title});
})

app.get('/products', (req, res) => {
    const title = 'Product Page';
    res.render('products', {title});
})

// CHALLENGE: Send file using ABSOLUTE path
app.get('/test-1', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/test-1.html'));
})

// CHALLENGE: Send file using RELATIVE path
app.get('/test-2', (req, res) => {
    res.sendFile('test-2.html', {root: path.join(__dirname, '/src/views')});
})

// CHALLENGE: Add a student EJS page
app.get('/student', (req, res) => {
    const title = 'Student Page';
    const student = {
        name: "Billy",
        id: 42,
        email: "billy@bob.com",
        address: "1234 Wompty St., Brismacity, ST"
    } 
    res.render('student', {title, student});
})

/**
 * Start server on specified port
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})