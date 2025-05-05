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

CREATE TABLE product (
  productID SERIAL PRIMARY KEY,
  sellerID VARCHAR(50) REFERENCES users(userID) ON DELETE SET NULL
  productName TEXT NOT NULL,
  productPrice NUMERIC(10, 2) NOT NULL,
  productPicture TEXT,
  avgRating NUMERIC(2, 1),
  category TEXT,
  description TEXT
);

CREATE TABLE orders (
  orderID SERIAL PRIMARY KEY,
  buyerID VARCHAR(50) REFERENCES users(userID),
  FOREIGN KEY (productID) REFERENCES products(productID),
  totalAmount NUMERIC(10,2) NOT NULL,
  placed_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart (
  cartID SERIAL PRIMARY KEY,
  buyerID INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (productID) REFERENCES products(productID),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  reviewID SERIAL PRIMARY KEY,
  productID INTEGER NOT NULL REFERENCES product(productID) ON DELETE CASCADE,
  reviewerID VARCHAR(50) NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
//review table