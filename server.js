/**
 * Imports
 */
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';


// Course data - place this after imports, before routes
const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
        ]
    },
    'MATH110': {
        id: 'MATH110',
        title: 'College Algebra',
        description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
        credits: 4,
        sections: [
            { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
            { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
            { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'Academic Writing',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
        ]
    }
};


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



app.use((req, res, next) => {
    // Skip logging for routes that start with /. (like /.well-known)
    if (!req.path.startsWith('/.')) {
        console.log(`${req.method} ${req.url}`);
    }
    next(); // Pass control to the next middleware or route
})

// Set the current year in a local variable
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
})

// Time based greeting
app.use((req, res, next) => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        res.locals.greeting = "Good Morning";
    } else if (currentHour < 17 ) {
        res.locals.greeting = "Good Afternoon";
    } else {
        res.locals.greeting = "Good Evening";
    }
    next();
})

// change background color
app.use((req, res, next) => {
    const themes = ['blue-theme', 'green-theme', 'red-theme'];

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;
    next();
})

// Global middleware to share query parameters with templates
app.use((req, res, next) => {
    res.locals.queryParams = req.query || {};
    next();
})

// Route-specific middleware that sets custom headers
const addDemoHeaders = (req, res, next) => {
    res.set('X-Demo-Page', 'true');
    res.set('X-Middleware-Demo', 'To Demo with love');

    next();
}
app.get('/demo', addDemoHeaders, (req, res) => {
    res.render('demo', {
        title: 'Middleware Demo Page'
    });
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

// Test route for 500 errors
app.get('/test-error', (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
});

// Course catalog list page
app.get('/catalog', (req, res) => {
    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
});
// Course detail route with sorting
app.get('/catalog/:courseId', (req, res, next) => {
    const courseId = req.params.courseId;
    const course = courses[courseId];

    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    // Get sor parameter (default to 'time')
    const sortBy = req.query.sort || 'time';

    // Create a copy of section to sort
    let sortedSections = [...course.sections];

    // sort based on the parameter
    switch (sortBy) {
        case 'professor':
            sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
            break;
        case 'room':
            sortedSections.sort((a, b) => a.room.localeCompare(b.room));
            break;
        case 'time':
        default:
            // Keep original time order as default
            break;
    }

    // Log the parameter for debugging
    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

    //Render the course detail template
    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
});


// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    // Prevent infinite loops, if a response has already been sent, do nothing
    if (res.headersSent || res.finished) {
        return next(err);
    }

    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack
    };

    // Render the appropriate error template with fallback
    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        // If rendering fails, send a simple error page instead
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
});

/**
 * Start server on specified port
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})