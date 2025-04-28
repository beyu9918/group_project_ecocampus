import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url'; // 处理 __dirname
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

// 注册接口（返回JSON）
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

// 登录接口（返回token）
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

// 注册表单接口（返回EJS页面）
export function registerForm(req, res) {
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
}

// 登录表单接口（返回EJS页面）
export function loginForm(req, res) {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('success', { message: '❌ Invalid email or password' });
  }

  res.render('success', { message: `🎉 Welcome back, ${user.name}` });
}