CREATE TABLE users (
  userID VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20),
  phone VARCHAR(30),
  avatar TEXT,
  bio TEXT,
  address TEXT,
  gender VARCHAR(20),
  birthday DATE,
  createdAt TIMESTAMP
);