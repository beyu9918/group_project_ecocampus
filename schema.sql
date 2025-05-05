-- =========================
-- EcoCampus Exchange Schema
-- =========================

-- 用户表（注册 / 登录用）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  userID TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  address TEXT,
  gender TEXT,
  birthday DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS product (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category VARCHAR(100),
  image VARCHAR(255),
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  avgRating NUMERIC(3, 2) DEFAULT 0
);

-- 评论表
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT
);


