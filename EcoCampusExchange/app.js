import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


import searchRoutes from './routes/searchRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// login
app.use((req, res, next) => {
  req.user = { id: 1, name: 'TestUser' }; // user ID is 1
  next();
});

app.use('/search', searchRoutes);
app.use('/item', reviewRoutes);

//router
app.get('/', (req, res) => res.redirect('/search'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});