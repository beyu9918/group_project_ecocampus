const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

exports.register = (req, res) => {
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
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ msg: 'Login successful', token });
};

exports.registerForm = (req, res) => {
  const { email, password, name } = req.body;
  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.render('success', { message: '⚠️ Email already registered.' });
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

  res.render('success', { message: '✅ Registered successfully!' });
};

exports.loginForm = (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('success', { message: '❌ Invalid email or password' });
  }

  res.render('success', { message: `🎉 Welcome back, ${user.name}` });
};