import express from 'express';
import debug from 'debug';
import * as server from './config/server.js';
import { homeRouter } from './routes/home.js';

// Setup debug module to spit out all messages
// Do `npn start` to see the debug messages
export const codeTrace = debug('comp3028:server');

// Start the app
export const app = express();
server.setup(app)

// Register any middleware here

// Register routers here
app.use('/', homeRouter);

// Not encouraged, but this is a simple example of how to register a route without a router.
app.get('/test', (req, res) => {
  res.send('Test');
});



import productRoutes from './routes/product.js';
app.use('/', productRoutes);



// ####################################### No need to modify below this line #######################################
// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

