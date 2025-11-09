const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.resolve(dataDir, 'database.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);

// Create tables
db.exec(`
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  image TEXT
);

CREATE TABLE variants (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  color TEXT,
  storage TEXT,
  price REAL,
  mrp REAL,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE emi_plans (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  variant_id TEXT,
  tenure_months INTEGER,
  interest_rate REAL,
  cashback REAL DEFAULT 0,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(variant_id) REFERENCES variants(id)
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  product_id TEXT,
  variant_id TEXT,
  emi_plan_id TEXT,
  monthly_payment REAL,
  total_paid REAL,
  meta TEXT
);
`);

// Insert sample products (3 products, each 2 variants)
const insertProduct = db.prepare(`INSERT INTO products (id, name, slug, description, image) VALUES (?, ?, ?, ?, ?)`);
const insertVariant = db.prepare(`INSERT INTO variants (id, product_id, color, storage, price, mrp) VALUES (?, ?, ?, ?, ?, ?)`);
const insertEmi = db.prepare(`INSERT INTO emi_plans (id, product_id, variant_id, tenure_months, interest_rate, cashback) VALUES (?, ?, ?, ?, ?, ?)`);

function addSample() {
    // Product 1
    const p1 = uuidv4();
    insertProduct.run(p1, 'Apple iPhone 17 Pro', 'iphone-17-pro', 'Apple iPhone 17 Pro with advanced camera', '/images/iphone17pro.jpg');
    const p1v1 = uuidv4();
    const p1v2 = uuidv4();
    insertVariant.run(p1v1, p1, 'Silver', '256 GB', 119999, 129999);
    insertVariant.run(p1v2, p1, 'Graphite', '512 GB', 134999, 144999);
    insertEmi.run(uuidv4(), p1, p1v1, 12, 0.0, 0);
    insertEmi.run(uuidv4(), p1, p1v1, 24, 10.5, 2000);

    // Product 2
    const p2 = uuidv4();
    insertProduct.run(p2, 'Samsung Galaxy S24 Ultra', 'samsung-s24-ultra', 'Samsung flagship with great display', '/images/s24ultra.jpg');
    const p2v1 = uuidv4();
    const p2v2 = uuidv4();
    insertVariant.run(p2v1, p2, 'Phantom Black', '256 GB', 109999, 119999);
    insertVariant.run(p2v2, p2, 'Titanium', '512 GB', 124999, 134999);
    insertEmi.run(uuidv4(), p2, p2v1, 6, 0.0, 0);
    insertEmi.run(uuidv4(), p2, p2v1, 12, 9.0, 1500);

    // Product 3
    const p3 = uuidv4();
    insertProduct.run(p3, 'Google Pixel 9', 'google-pixel-9', 'Google Pixel with clean Android', '/images/pixel9.jpg');
    const p3v1 = uuidv4();
    const p3v2 = uuidv4();
    insertVariant.run(p3v1, p3, 'Black', '128 GB', 59999, 64999);
    insertVariant.run(p3v2, p3, 'White', '256 GB', 69999, 74999);
    insertEmi.run(uuidv4(), p3, p3v1, 12, 7.5, 500);
    insertEmi.run(uuidv4(), p3, p3v1, 24, 12.0, 1000);
}

addSample();

console.log('Database seeded at', dbPath);