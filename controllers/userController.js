import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url'; // Handle __dirname
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const usersPath = path.join(__dirname, '../data/users.json');

const readUsers = () => {
  const data = fs.readFileSync(usersPath);
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

const generateToken = (user) => {
  return jwt.sign({ email: user.email, role: user.role }, 'secret123', { expiresIn: '1d' });
};

const generateId = (prefix) => {
  return `${prefix}_${Date.now()}`;
};

// register prot（return JSON）
export function register(req, res) {
  const { email, password, name } = req.body;
  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ msg: 'Email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    email,
    password: hashedPassword,
    name,
    role: 'normal',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ msg: 'User registered successfully', user: { email, name } });
}

// login port（return token）
export function login(req, res) {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ msg: 'Login successful', token });
}

// registering（return EJS page）
export function registerForm(req, res) {
  const { email, password, name } = req.body;
  const users = readUsers();
  

  if (users.find(u => u.email === email)) {
    return res.render('success', { message: '⚠️ Email already registered.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    userID: generateId('user'), // new user id
    email,
    password: hashedPassword,
    name,
    role: 'normal',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  res.render('success', { message: ' Registered successfully!' });
}

// login table port（return EJS page）
export function loginForm(req, res) {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('success', { message: 'Invalid email or password' });
  }
  req.session.user = user; //
  res.redirect('/profile');
}

export function updateProfile(req, res) {
  const { email, phone, avatar, bio, address, gender, birthday } = req.body;
  const users = readUsers();
  
  // 
  const userId = req.session.user.userID;

  const user = users.find(u => u.userID === userId);

  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  // updated information
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.avatar = avatar || user.avatar;
  user.bio = bio || user.bio;
  user.address = address || user.address;
  user.gender = gender || user.gender;
  user.birthday = birthday || user.birthday;

  writeUsers(users);

  res.json({ msg: 'Profile updated successfully', user });
}