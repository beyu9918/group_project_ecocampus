import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from '../db.js'; // PostgreSQL connection

// Generate JWT token for authenticated users
const generateToken = (user) => {
  return jwt.sign({ email: user.email, role: user.role }, 'secret123', { expiresIn: '1d' });
};

// Register via JSON API
export async function register(req, res) {
  const { email, password, name } = req.body;

  try {
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    // add password validation
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        msg: 'Password must be at least 8 characters long and include both letters and numbers.'
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await sql`
      INSERT INTO users (
        email, password, name, role
      ) VALUES (
        ${email}, ${hashedPassword}, ${name}, 'user'
      )
    `;

    res.status(201).json({ msg: 'User registered successfully', user: { email, name } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
}

// Login via JSON
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = result[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
}

// Register via EJS form
export async function registerForm(req, res) {
  const { email, password, name } = req.body;

  try {
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.render('success', { message: '⚠️ Email already registered.' });
    }

    // add password validation
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.render('success', {
        message: '⚠️ Password must be at least 8 characters long and include both letters and numbers.'
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await sql`
      INSERT INTO users (
        email, password, name, role
      ) VALUES (
        ${email}, ${hashedPassword}, ${name}, 'user'
      )
    `;

    res.render('success', { message: 'Registered successfully!' });
  } catch (err) {
    console.error('RegisterForm error:', err);
    res.render('success', { message: 'Internal error occurred.' });
  }
}

// Login via EJS form
export async function loginForm(req, res) {
  const { email, password } = req.body;

  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = result[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('success', { message: 'Invalid email or password' });
    }

    req.session.user = user;
    res.redirect('/product');
  } catch (err) {
    console.error('LoginForm error:', err);
    res.render('success', { message: 'Login failed due to server error.' });
  }
}

// Update user profile
export async function updateProfile(req, res) {
  if (!req.session.user) return res.redirect('/login');

  const userId = req.session.user.userid;
  const { email, phone, bio, address, gender, birthday } = req.body;
  const parsedBirthday = birthday && !isNaN(new Date(birthday)) ? new Date(birthday) : null;

  let avatarPath = req.session.user.avatar || '';

  // If user upload new avatar
  if (req.files && req.files.avatar) {
    const avatarFile = req.files.avatar;
    const filename = `avatar_${userId}_${Date.now()}_${avatarFile.name}`;
    const uploadPath = path.join('public/uploads/', filename);

    // move file to target directory
    await avatarFile.mv(uploadPath);

    // database directory
    avatarPath = `/uploads/${filename}`;
  }

  try {
    await sql`
      UPDATE users SET
        name = ${req.body.name},
        email = ${email},
        phone = ${phone},
        avatar = ${avatarPath},
        bio = ${bio},
        address = ${address},
        gender = ${gender},
        birthday = ${parsedBirthday}
      WHERE userID = ${userId}
    `;

    const result = await sql`SELECT * FROM users WHERE userID = ${userId}`;
    req.session.user = result[0];

    res.render('success', {
      message: 'Profile updated successfully.',
      backLink: '/profile'
    });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.render('success', { message: 'Profile update failed due to server error.' });
  }
}

// Render profile page
export async function renderProfilePage(req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.userid;

  try {
    const result = await sql`SELECT * FROM users WHERE userID = ${userId}`;
    const user = result[0];

    if (!user) {
      return res.render('success', { message: 'User not found.' });
    }

    if (user.birthday) {
      user.birthday = new Date(user.birthday).toISOString().split('T')[0];
    }

    res.render('profile', { user });
  } catch (err) {
    console.error('RenderProfilePage error:', err);
    res.render('success', { message: 'Failed to load profile.' });
  }
}

// [NEW] Admin-only: View all users
export async function viewAllUsers(req, res) {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).send('Access denied.');
    }

    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;

    res.render('userSQL', { users });
  } catch (err) {
    console.error('ViewAllUsers error:', err);
    res.status(500).send('Server error');
  }
  
}
// Admin-only: View orders of a user
export async function viewUserOrders(req, res) {
  const { id } = req.params;

  try {
    const orders = await sql`SELECT * FROM orders WHERE buyerid = ${id}`;
    res.render('orderSQL', { orders });
  } catch (err) {
    console.error('ViewUserOrders error:', err);
    res.status(500).send('Failed to load orders.');
  }
}

// Admin-only: View products posted by a user
export async function viewUserProducts(req, res) {
  const { id } = req.params;

  try {
    const products = await sql`SELECT * FROM product WHERE sellerid = ${id}`;
    res.render('productSQL', { products });
  } catch (err) {
    console.error('ViewUserProducts error:', err);
    res.status(500).send('Failed to load products.');
  }
}

//  Admin-only: View cart content of a user
export async function viewUserCart(req, res) {
  const { id } = req.params;

  try {
    const cart = await sql`SELECT * FROM cart WHERE buyerid = ${id}`;
    res.render('cartSQL', { cart });
  } catch (err) {
    console.error('ViewUserCart error:', err);
    res.status(500).send('Failed to load cart.');
  }
}

//  Admin-only: View reviews made by a user
export async function viewUserReviews(req, res) {
  const { id } = req.params;

  try {
    const reviews = await sql`SELECT * FROM reviews WHERE reviewerid = ${id}`;
    res.render('reviewsSQL', { reviews });
  } catch (err) {
    console.error('ViewUserReviews error:', err);
    res.status(500).send('Failed to load reviews.');
  }
}
// Admin-only: Delete account
export async function deleteUser(req, res) {
  const { id } = req.params;

  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied.');
  }

  try {
    await sql`DELETE FROM users WHERE userID = ${id}`;
    res.redirect('/admin/users');
  } catch (err) {
    console.error('DeleteUser error:', err);
    res.status(500).send('Failed to delete user.');
  }
}
// Admin-only: Change User role
export async function changeUserRole(req, res) {
  const { id } = req.params;

  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied.');
  }

  try {
    const user = (await sql`SELECT * FROM users WHERE userID = ${id}`)[0];
    if (!user) return res.status(404).send('User not found.');

    const newRole = user.role === 'admin' ? 'user' : 'admin';

    await sql`
      UPDATE users SET role = ${newRole}
      WHERE userID = ${id}
    `;

    res.redirect('/admin/users');
  } catch (err) {
    console.error('ChangeUserRole error:', err);
    res.status(500).send('Failed to update user role.');
  }
}
//Render UserPage
export async function renderUserPage(req, res) {
  const { id } = req.params;

  // make sure userid valid
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return res.status(400).send('Invalid user ID');
  }

  try {
    // get baisc info from user
    const result = await sql`SELECT * FROM users WHERE userID = ${parsedId}`;
    const user = result[0];
    if (!user) return res.status(404).send('User not found');

    // get user product
    const products = await sql`SELECT * FROM product WHERE sellerid = ${parsedId}`;

    // get user comment
    const reviews = await sql`
      SELECT r.*, p.productname
      FROM reviews r
      JOIN product p ON r.productid = p.productid
      WHERE p.sellerid = ${parsedId}
      ORDER BY r.createdat DESC
    `;

    res.render('userPage', { user, products, reviews });
  } catch (err) {
    console.error('renderUserPage error:', err);
    res.status(500).send('Failed to load user page');
  }
}