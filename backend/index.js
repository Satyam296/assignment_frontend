const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dbPath = path.resolve(__dirname, 'data', 'database.db');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync(dbPath)) {
    console.error('Database not found. Run `npm run seed` in the backend folder to create sample data.');
    process.exit(1);
}

const db = new Database(dbPath, { readonly: false });

function computeMonthlyPayment(principal, annualRatePercent, months) {
    const rate = (annualRatePercent || 0) / 100 / 12;
    if (!rate) return +(principal / months).toFixed(2);
    const monthly = (principal * rate) / (1 - Math.pow(1 + rate, -months));
    return +monthly.toFixed(2);
}

// GET /api/products
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    const result = products.map((p) => {
        const variants = db.prepare('SELECT * FROM variants WHERE product_id = ?').all(p.id);
        const variantsWithEmi = variants.map((v) => {
            const emis = db.prepare('SELECT * FROM emi_plans WHERE variant_id = ?').all(v.id);
            const emiDetails = emis.map((e) => ({
                id: e.id,
                tenure_months: e.tenure_months,
                interest_rate: e.interest_rate,
                cashback: e.cashback,
                monthly_payment: computeMonthlyPayment(v.price, e.interest_rate, e.tenure_months),
            }));
            return {...v, emi_plans: emiDetails };
        });
        return {...p, variants: variantsWithEmi };
    });
    res.json(result);
});

// GET /api/products/:slug
app.get('/api/products/:slug', (req, res) => {
    const slug = req.params.slug;
    const p = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    const variants = db.prepare('SELECT * FROM variants WHERE product_id = ?').all(p.id);
    const variantsWithEmi = variants.map((v) => {
        const emis = db.prepare('SELECT * FROM emi_plans WHERE variant_id = ?').all(v.id);
        const emiDetails = emis.map((e) => ({
            id: e.id,
            tenure_months: e.tenure_months,
            interest_rate: e.interest_rate,
            cashback: e.cashback,
            monthly_payment: computeMonthlyPayment(v.price, e.interest_rate, e.tenure_months),
        }));
        return {...v, emi_plans: emiDetails };
    });
    res.json({...p, variants: variantsWithEmi });
});

// Orders
app.post('/api/orders', (req, res) => {
    const { productId, variantId, emiPlanId, monthlyPayment, totalPaid, meta } = req.body;
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO orders (id, created_at, product_id, variant_id, emi_plan_id, monthly_payment, total_paid, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, createdAt, productId, variantId, emiPlanId, monthlyPayment || 0, totalPaid || 0, meta ? JSON.stringify(meta) : null);
    res.json({ id, createdAt });
});

app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));