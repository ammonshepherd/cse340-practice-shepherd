/**
 * Helper function to get the current greeting based on the time of day.
 */
const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return 'Good Morning!';
    }

    if (currentHour < 18) {
        return 'Good Afternoon!';
    }

    return 'Good Evening!';
};

/**
 * Middleware to add local variables to res.locals for use in all templates.
 * Templates can access these values but are not required to use them.
 */
const addLocalVariables = (req, res, next) => {
    // Set current year for use in templates
    res.locals.currentYear = new Date().getFullYear();

    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // Make req.query available to all templates
    res.locals.queryParams = { ...req.query };

    // Set greeting based on time of day
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;

    // Randomly assign a theme class to the body
    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;

    // Continue to the next middleware or route handler
    next();
};

// const reloadBrowser = async () => {
//     if (NODE_ENV.includes('dev')) {
//         const ws = await import('ws');

//         try {
//             const wsPort = parseInt(PORT) + 1;
//             const wsServer = new ws.WebSocketServer({ port: wsPort });
//             wsServer.on('listening', () => {
//                 console.log(`WebSocket server is running on port ${wsPort}`);
//             });
//             wsServer.on('error', (error) => {
//                 console.error('WebSocket server error:', error);
//             });
//         } catch (error) {
//             console.error('Failed to start WebSocket server: ', error);
//         }
//     }
// }

// export { addLocalVariables, reloadBrowser };
export { addLocalVariables };