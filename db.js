import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'insightboard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      order_id VARCHAR(40) NOT NULL,
      customer VARCHAR(160) NOT NULL,
      product VARCHAR(160) NOT NULL,
      category VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
      cost NUMERIC(12,2) NOT NULL CHECK (cost >= 0),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  const count = await pool.query('SELECT COUNT(*)::int AS count FROM transactions')
  if (count.rows[0].count === 0) {
    const demo = [
      ['2026-10-01','ORD-1042','Northstar Studio','Wireless Headphones','Electronics',4,129,71],
      ['2026-10-02','ORD-1043','Mira Patel','Desk Lamp','Home & Living',2,58,26],
      ['2026-10-03','ORD-1044','Brightline Co.','Everyday Backpack','Accessories',8,74,31],
      ['2026-10-04','ORD-1045','Arjun Mehta','Smart Watch','Electronics',3,189,112],
      ['2026-10-05','ORD-1046','Olive & Oak','Ceramic Mug Set','Home & Living',12,32,13],
      ['2026-10-06','ORD-1047','Studio Fern','Leather Wallet','Accessories',6,67,28],
      ['2026-10-07','ORD-1048','Mira Patel','Bluetooth Speaker','Electronics',5,96,44],
      ['2026-10-08','ORD-1049','Northstar Studio','Throw Blanket','Home & Living',7,83,39],
      ['2026-10-09','ORD-1050','Kite Creative','Laptop Stand','Accessories',9,42,17],
      ['2026-10-10','ORD-1051','Arjun Mehta','Smart Watch','Electronics',2,189,112],
      ['2026-10-11','ORD-1052','Olive & Oak','Desk Lamp','Home & Living',4,58,26],
      ['2026-10-12','ORD-1053','Studio Fern','Wireless Headphones','Electronics',3,129,71],
      ['2026-10-13','ORD-1054','Kite Creative','Everyday Backpack','Accessories',5,74,31],
      ['2026-10-14','ORD-1055','Mira Patel','Ceramic Mug Set','Home & Living',10,32,13],
      ['2026-10-15','ORD-1056','Brightline Co.','Bluetooth Speaker','Electronics',4,96,44],
      ['2026-10-16','ORD-1057','Northstar Studio','Leather Wallet','Accessories',7,67,28],
      ['2026-10-17','ORD-1058','Arjun Mehta','Throw Blanket','Home & Living',3,83,39],
      ['2026-10-18','ORD-1059','Studio Fern','Laptop Stand','Accessories',6,42,17],
      ['2026-10-19','ORD-1060','Kite Creative','Smart Watch','Electronics',3,189,112],
      ['2026-10-20','ORD-1061','Olive & Oak','Desk Lamp','Home & Living',6,58,26]
    ]
    for (const row of demo) {
      await pool.query(
        'INSERT INTO transactions (date,order_id,customer,product,category,quantity,unit_price,cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        row
      )
    }
  }
}
