import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool, initDb } from './db.js'

dotenv.config()
const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json({ limit: '5mb' }))

const shape = r => ({
  ...r,
  id: Number(r.id),
  quantity: Number(r.quantity),
  unit_price: Number(r.unit_price),
  cost: Number(r.cost),
  revenue: Number(r.quantity) * Number(r.unit_price),
  profit: Number(r.quantity) * (Number(r.unit_price) - Number(r.cost)),
  date: String(r.date).slice(0, 10)
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.get('/api/transactions', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC')
    res.json(rows.map(shape))
  } catch (error) {
    console.error('GET /api/transactions:', error.message)
    res.status(500).json({ error: 'Could not read transactions. Check PostgreSQL settings.' })
  }
})

app.post('/api/transactions/import', async (req, res) => {
  const rows = req.body
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 5000) {
    return res.status(400).json({ error: 'Send between 1 and 5000 transaction rows.' })
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const row of rows) {
      const quantity = Number(row.quantity), unitPrice = Number(row.unit_price), cost = Number(row.cost)
      if (!row.date || !row.order_id || !row.customer || !row.product || !row.category ||
          !Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(unitPrice) || unitPrice < 0 ||
          !Number.isFinite(cost) || cost < 0) {
        throw new Error('Each row needs date, order_id, customer, product, category, quantity, unit_price and cost.')
      }
      await client.query(
        'INSERT INTO transactions (date,order_id,customer,product,category,quantity,unit_price,cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [row.date, row.order_id, row.customer, row.product, row.category, quantity, unitPrice, cost]
      )
    }
    await client.query('COMMIT')
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC')
    res.status(201).json(result.rows.map(shape))
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: error.message || 'Import failed.' })
  } finally {
    client.release()
  }
})

const port = Number(process.env.PORT || 5000)
try {
  await initDb()
  app.listen(port, () => console.log(`InsightBoard API running at http://localhost:${port}`))
} catch (error) {
  console.error('Could not connect to PostgreSQL. Check server/.env and make sure PostgreSQL is running.')
  console.error(error.message)
  process.exit(1)
}
