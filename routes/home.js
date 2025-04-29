import express from 'express';
import * as home from '../controllers/home.js';

export const homeRouter = express.Router()

// Below are all the routes for the home
homeRouter.get('/', home.index);


/*

//new default launch page (from hank's code)
homeRouter.get('/', (req, res) => {
    res.render('login', { title: 'Login Page' });
  });
  
*/

