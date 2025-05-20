CREATE TABLE IF NOT EXISTS users (
  userID SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  address TEXT,
  gender TEXT,
  birthday DATE,
  role TEXT CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product (
  productID SERIAL PRIMARY KEY,
  sellerID INTEGER REFERENCES users(userID) ON DELETE SET NULL,
  productName TEXT NOT NULL,
  productPrice NUMERIC(10, 2) NOT NULL,
  productPicture TEXT,
  avgRating NUMERIC(2, 1) CHECK (avgRating BETWEEN 1 AND 5),
  category TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  reviewID SERIAL PRIMARY KEY,
  productID INTEGER NOT NULL REFERENCES product(productID) ON DELETE CASCADE,
  reviewerID INTEGER NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (productID, reviewerID)
);

CREATE TABLE orders (
  orderID SERIAL PRIMARY KEY,
  buyerID INTEGER REFERENCES users(userID),
  productID INTEGER REFERENCES product(productID),
  totalAmount NUMERIC(10,2) NOT NULL,
  placed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart (
  cartID SERIAL PRIMARY KEY,
  buyerID INTEGER NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
  productID INTEGER REFERENCES product(productID),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (buyerID, productID)
);


--message table
CREATE TABLE messages (
  messageID SERIAL PRIMARY KEY,
  senderID INTEGER NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
  receiverID INTEGER NOT NULL REFERENCES users(userID) ON DELETE CASCADE,
  productID INTEGER REFERENCES product(productID),
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (senderID <> receiverID)
);
