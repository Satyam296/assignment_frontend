# EMI Product Showcase Application

A full-stack web application that displays products with multiple EMI plans backed by mutual funds. The application shows products like smartphones with various EMI options, similar to platforms like Snapmint.

## Live Demo
- Frontend: [https://satyam296.github.io/assignment_frontend/](https://satyam296.github.io/assignment_frontend/)
- Backend: [https://assignment-backend-zxrv.onrender.com](https://assignment-backend-zxrv.onrender.com)

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM
- Axios for API calls

### Backend
- Node.js
- Express.js
- PostgreSQL
- Nodemailer (for notifications)

## Features
- Dynamic product pages with unique URLs
- Multiple product variants (storage, color)
- EMI plan selection with different tenures
- Responsive design
- Real-time EMI calculations
- Database-driven content
- Admin dashboard for product management

## API Endpoints

### Products

#### Get All Products
```
GET /api/products
```
Response:
```json
{
  "products": [
    {
      "id": 1,
      "name": "iPhone 17 Pro",
      "basePrice": 129900,
      "description": "Latest iPhone with advanced features",
      "variants": [
        {
          "id": 1,
          "storage": "256GB",
          "color": "Silver",
          "price": 139900
        }
      ]
    }
  ]
}
```

#### Get Single Product
```
GET /api/products/:id
```
Response:
```json
{
  "id": 1,
  "name": "iPhone 17 Pro",
  "basePrice": 129900,
  "description": "Latest iPhone with advanced features",
  "variants": [...],
  "emiPlans": [
    {
      "id": 1,
      "monthlyPayment": 10825,
      "tenure": 12,
      "interestRate": 0,
      "cashback": 2000
    }
  ]
}
```

### EMI Plans

#### Get EMI Plans for Product
```
GET /api/products/:id/emi-plans
```
Response:
```json
{
  "emiPlans": [
    {
      "id": 1,
      "monthlyPayment": 10825,
      "tenure": 12,
      "interestRate": 0,
      "cashback": 2000
    }
  ]
}
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Product Variants Table
```sql
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    storage VARCHAR(50),
    color VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### EMI Plans Table
```sql
CREATE TABLE emi_plans (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    monthly_payment DECIMAL(10,2) NOT NULL,
    tenure INTEGER NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    cashback DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### Frontend Setup
1. Clone the repository
```bash
git clone https://github.com/Satyam296/assignment_frontend.git
cd assignment_frontend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add:
```
VITE_API_BASE_URL=https://assignment-backend-zxrv.onrender.com
```

4. Start the development server
```bash
npm run dev
```

### Backend Setup
1. Navigate to backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file and add:
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/emi_products
```

4. Initialize the database
```bash
node seed.js
```

5. Start the server
```bash
npm start
```

## Project Structure
```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
└── backend/
    ├── routes/
    ├── models/
    ├── db.js
    ├── seed.js
    └── package.json
```

## Deployment

### Frontend
The frontend is deployed on GitHub Pages. Any push to the main branch triggers automatic deployment through GitHub Actions.

### Backend
[Add your backend deployment instructions]

## Video Demo
[Add your video demo link]

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
