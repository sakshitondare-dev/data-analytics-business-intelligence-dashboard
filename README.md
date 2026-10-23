# InsightBoard — Data Analytics & Business Intelligence Dashboard

A modern dashboard mini-project using React, Vite, Chart.js, Node.js, Express and PostgreSQL.

## Features
- KPI cards: revenue, orders, customers, profit
- Interactive revenue line chart, category doughnut chart and top-products bar chart
- Searchable transactions table
- CSV import for transactions
- Export filtered transactions to CSV
- Date-range filter
- Responsive layout and sidebar navigation
- PostgreSQL database API, with demo-data fallback if the backend is not running

## Requirements
- Node.js 18+
- PostgreSQL 14+ (optional for demo-only frontend mode)
- VS Code

## 1. Configure PostgreSQL
Create a database named `insightboard` in pgAdmin or the PostgreSQL terminal.

Then open `server/.env.example`, copy it to `server/.env`, and update your PostgreSQL username/password.

Example:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insightboard
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=5000
```

## 2. Start the backend
Open a terminal in the `server` folder:
```
npm install
npm run dev
```
The API starts at http://localhost:5000 and creates the transactions table automatically.

## 3. Start the frontend
Open a second terminal in the project folder:
```
npm install
npm run dev
```
Open the local URL Vite displays, usually http://localhost:5173.

## 4. Demo mode
If PostgreSQL/backend is not running, the dashboard uses built-in sample data in the browser. CSV import/export and charts still work in this mode. For persistent database storage, run the backend and configure PostgreSQL.

## CSV format
Required columns: `date,order_id,customer,product,category,quantity,unit_price,cost`
Example:
```
date,order_id,customer,product,category,quantity,unit_price,cost
2026-10-01,ORD-1001,Acme Ltd,Wireless Mouse,Accessories,3,25,12
```
The dashboard calculates revenue as `quantity * unit_price` and profit as `quantity * (unit_price - cost)`.

## Project structure
```
insightboard_bi_dashboard/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    styles.css
    data.js
  server/
    package.json
    .env.example
    db.js
    index.js
```

## Notes
- The supplied sample numbers are illustrative, not real business data.
- Keep your `server/.env` private; do not upload passwords to GitHub.
