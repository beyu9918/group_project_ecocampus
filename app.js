import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import './db.js'; 
import searchRoutes from './routes/searchRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// login
app.use((req, res, next) => {
  req.user = { userID: 1, name: 'TestUser' }; 
  next();
});

// router
app.use('/search', searchRoutes);
app.use('/product', reviewRoutes);


app.get('/', (req, res) => res.redirect('/search'));

// mistake
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});