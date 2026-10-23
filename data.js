export const sampleTransactions = [
  { id: 1, date: '2026-10-01', order_id: 'ORD-1042', customer: 'Northstar Studio', product: 'Wireless Headphones', category: 'Electronics', quantity: 4, unit_price: 129, cost: 71 },
  { id: 2, date: '2026-10-02', order_id: 'ORD-1043', customer: 'Mira Patel', product: 'Desk Lamp', category: 'Home & Living', quantity: 2, unit_price: 58, cost: 26 },
  { id: 3, date: '2026-10-03', order_id: 'ORD-1044', customer: 'Brightline Co.', product: 'Everyday Backpack', category: 'Accessories', quantity: 8, unit_price: 74, cost: 31 },
  { id: 4, date: '2026-10-04', order_id: 'ORD-1045', customer: 'Arjun Mehta', product: 'Smart Watch', category: 'Electronics', quantity: 3, unit_price: 189, cost: 112 },
  { id: 5, date: '2026-10-05', order_id: 'ORD-1046', customer: 'Olive & Oak', product: 'Ceramic Mug Set', category: 'Home & Living', quantity: 12, unit_price: 32, cost: 13 },
  { id: 6, date: '2026-10-06', order_id: 'ORD-1047', customer: 'Studio Fern', product: 'Leather Wallet', category: 'Accessories', quantity: 6, unit_price: 67, cost: 28 },
  { id: 7, date: '2026-10-07', order_id: 'ORD-1048', customer: 'Mira Patel', product: 'Bluetooth Speaker', category: 'Electronics', quantity: 5, unit_price: 96, cost: 44 },
  { id: 8, date: '2026-10-08', order_id: 'ORD-1049', customer: 'Northstar Studio', product: 'Throw Blanket', category: 'Home & Living', quantity: 7, unit_price: 83, cost: 39 },
  { id: 9, date: '2026-10-09', order_id: 'ORD-1050', customer: 'Kite Creative', product: 'Laptop Stand', category: 'Accessories', quantity: 9, unit_price: 42, cost: 17 },
  { id: 10, date: '2026-10-10', order_id: 'ORD-1051', customer: 'Arjun Mehta', product: 'Smart Watch', category: 'Electronics', quantity: 2, unit_price: 189, cost: 112 },
  { id: 11, date: '2026-10-11', order_id: 'ORD-1052', customer: 'Olive & Oak', product: 'Desk Lamp', category: 'Home & Living', quantity: 4, unit_price: 58, cost: 26 },
  { id: 12, date: '2026-10-12', order_id: 'ORD-1053', customer: 'Studio Fern', product: 'Wireless Headphones', category: 'Electronics', quantity: 3, unit_price: 129, cost: 71 },
  { id: 13, date: '2026-10-13', order_id: 'ORD-1054', customer: 'Kite Creative', product: 'Everyday Backpack', category: 'Accessories', quantity: 5, unit_price: 74, cost: 31 },
  { id: 14, date: '2026-10-14', order_id: 'ORD-1055', customer: 'Mira Patel', product: 'Ceramic Mug Set', category: 'Home & Living', quantity: 10, unit_price: 32, cost: 13 },
  { id: 15, date: '2026-10-15', order_id: 'ORD-1056', customer: 'Brightline Co.', product: 'Bluetooth Speaker', category: 'Electronics', quantity: 4, unit_price: 96, cost: 44 },
  { id: 16, date: '2026-10-16', order_id: 'ORD-1057', customer: 'Northstar Studio', product: 'Leather Wallet', category: 'Accessories', quantity: 7, unit_price: 67, cost: 28 },
  { id: 17, date: '2026-10-17', order_id: 'ORD-1058', customer: 'Arjun Mehta', product: 'Throw Blanket', category: 'Home & Living', quantity: 3, unit_price: 83, cost: 39 },
  { id: 18, date: '2026-10-18', order_id: 'ORD-1059', customer: 'Studio Fern', product: 'Laptop Stand', category: 'Accessories', quantity: 6, unit_price: 42, cost: 17 },
  { id: 19, date: '2026-10-19', order_id: 'ORD-1060', customer: 'Kite Creative', product: 'Smart Watch', category: 'Electronics', quantity: 3, unit_price: 189, cost: 112 },
  { id: 20, date: '2026-10-20', order_id: 'ORD-1061', customer: 'Olive & Oak', product: 'Desk Lamp', category: 'Home & Living', quantity: 6, unit_price: 58, cost: 26 }
]

export const money = value => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(value || 0)

export const withMetrics = row => ({
  ...row,
  quantity: Number(row.quantity) || 0,
  unit_price: Number(row.unit_price) || 0,
  cost: Number(row.cost) || 0,
  revenue: (Number(row.quantity) || 0) * (Number(row.unit_price) || 0),
  profit: (Number(row.quantity) || 0) * ((Number(row.unit_price) || 0) - (Number(row.cost) || 0))
})
