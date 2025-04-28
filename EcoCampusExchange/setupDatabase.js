// setupDatabase.js

// This script initializes the local database for the EcoCampusExchange project

import sqlite3Pkg from 'sqlite3';
import path from 'path';
const sqlite3 = sqlite3Pkg.verbose();


// Define database file path
const dbPath = path.join(__dirname, './data/EcoCampus.db');
const db = new sqlite3.Database(dbPath);


// Create the 'items' table
function createTables() {
  console.log('reating items table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price REAL,
      avgRating REAL DEFAULT 0,
      createTime TEXT
    )
  `);
}


// Clear existing data from items table
function clearTables() {
  console.log('Clearing old items...');
  db.run(`DELETE FROM items`);
}

// Insert test items into the table
function insertTestData() {
  console.log('Inserting test items...');
  const stmt = db.prepare(`
    INSERT INTO items (title, description, category, price, avgRating, createTime)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const items = [
    ['Introduction to Machine Learning', 'Good condition textbook.', 'textbook', 50, 4.5, '2025-04-01T10:00:00Z'],
    ['Data Structures Book', 'Essential for CS students.', 'textbook', 45, 4.0, '2025-03-28T09:00:00Z'],
    ['Artificial Intelligence Basics', 'Almost new AI textbook.', 'textbook', 55, 4.6, '2025-04-05T16:00:00Z'],
    ['Algorithms Book', 'Recommended for algorithm courses.', 'textbook', 60, 4.2, '2025-03-26T09:20:00Z'],
    ['Computer Networks Book', 'Good reference material.', 'textbook', 48, 3.8, '2025-03-27T17:30:00Z'],
    ['Math Textbook', 'Basic algebra and calculus.', 'textbook', 40, 4.0, '2025-04-06T13:00:00Z'],
    ['Science Textbook', 'Physics and Chemistry basics.', 'textbook', 42, 3.9, '2025-04-06T14:00:00Z'],
    ['Physics Lab Kit', 'Includes beakers, flasks, and safety goggles.', 'lab', 150, 4.5, '2025-04-07T10:00:00Z'],
    ['Biology Microscope Set', 'Professional-grade student microscope.', 'lab', 300, 4.7, '2025-04-07T11:00:00Z'],
    ['Chemistry Starter Kit', 'Basic chemicals and glassware.', 'lab', 200, 4.4, '2025-04-07T12:00:00Z'],
    ['Electrical Engineering Kit', 'Breadboards, resistors, capacitors.', 'lab', 250, 4.6, '2025-04-07T13:00:00Z']
  ];

  items.forEach(item => {
    stmt.run(item);
  });

  stmt.finalize();
}


db.serialize(() => {
  createTables();
  clearTables();
  insertTestData();
});


db.close(() => {
  console.log('Database setup complete');
});