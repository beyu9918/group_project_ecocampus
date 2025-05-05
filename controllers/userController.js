import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from '../db.js'; // PostgreSQL connection
import { v4 as uuidv4 } from 'uuid'; // For generating unique userID

// Generate JWT token for authenticated users
const generateToken = (user) => {
  return jwt.sign({ email: user.email, role: user.role }, 'secret123', { expiresIn: '1d' });
};

// Register user and return JSON response
export async function register(req, res) {
  const { email, password, name } = req.body;

  try {
    // Check if email already exists
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    // Hash password and insert user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUserID = `user_${Date.now()}`;

    await sql`
      INSERT INTO users (
        userID, email, password, name, role, createdAt
      ) VALUES (
        ${newUserID}, ${email}, ${hashedPassword}, ${name}, 'normal', NOW()
      )`;

    res.status(201).json({ msg: 'User registered successfully', user: { email, name } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Internal server error' });
  }
}

// ✅ Login and return JWT token
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

// ✅ Register via EJS form
export async function registerForm(req, res) {
  const { email, password, name } = req.body;

  try {
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.render('success', { message: '⚠️ Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUserID = `user_${Date.now()}`;

    await sql`
      INSERT INTO users (
        userID, email, password, name, role, createdAt
      ) VALUES (
        ${newUserID}, ${email}, ${hashedPassword}, ${name}, 'normal', NOW()
      )`;

    res.render('success', { message: 'Registered successfully!' });
  } catch (err) {
    console.error('RegisterForm error:', err);
    res.render('success', { message: 'Internal error occurred.' });
  }
}
// ✅ Login via EJS form
export async function loginForm(req, res) {
  const { email, password } = req.body;

  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = result[0];

    // If user not found or password mismatch
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('success', { message: 'Invalid email or password' });
    }

    // Store user in session
    req.session.user = user;
    res.redirect('/profile');
  } catch (err) {
    console.error('LoginForm error:', err);
    res.render('success', { message: 'Login failed due to server error.' });
  }
}

// ✅ Update user profile
export async function updateProfile(req, res) {
  const { email, phone, avatar, bio, address, gender, birthday } = req.body;

  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.userid;

  try {
    // Update only non-null fields
    await sql`
      UPDATE users SET
        email = ${email},
        phone = ${phone},
        avatar = ${avatar},
        bio = ${bio},
        address = ${address},
        gender = ${gender},
        birthday = ${birthday}
      WHERE userID = ${userId}`;

    // Re-fetch updated user
    const result = await sql`SELECT * FROM users WHERE userID = ${userId}`;
    req.session.user = result[0]; // Update session

    res.render('success', {
      message: '✅ Profile updated successfully.',
      backLink: '/profile'
    });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.render('success', { message: 'Profile update failed due to server error.' });
  }
}

// ✅ Render profile page
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

    res.render('profile', { user });
  } catch (err) {
    console.error('RenderProfilePage error:', err);
    res.render('success', { message: 'Failed to load profile.' });
  }
}