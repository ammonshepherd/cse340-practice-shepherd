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

// Send file using ABSOLUTE path
app.get('/test-1', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/test-1.html'));
})

// Send file using RELATIVE path
app.get('/test-2', (req, res) => {
    res.sendFile('test-2.html', {root: path.join(__dirname, '/src/views')});
})

/**
 * Start server on specified port
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})