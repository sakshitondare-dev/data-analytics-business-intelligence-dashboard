import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, CircleHelp, CloudUpload, Command, Download, FileBarChart2,
  LayoutDashboard, Menu, MoreHorizontal, Package, Search, Settings2,
  ShoppingBag, Sparkles, Users, Wallet, X, Zap
} from 'lucide-react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { sampleTransactions, money, withMetrics } from './data'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const API = 'http://localhost:5000/api'
const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Analytics', icon: Activity },
  { label: 'Transactions', icon: ShoppingBag },
  { label: 'Reports', icon: FileBarChart2 }
]
const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#172033', padding: 12, cornerRadius: 10 } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#8992a7', font: { family: 'DM Sans' } } },
    y: { grid: { color: '#edf0f5' }, border: { display: false }, ticks: { color: '#8992a7', font: { family: 'DM Sans' } } }
  }
}

function App() {
  const [transactions, setTransactions] = useState(sampleTransactions.map(withMetrics))
  const [active, setActive] = useState('Overview')
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('This month')
  const [notice, setNotice] = useState('')
  const [backend, setBackend] = useState('demo')
  const [mobileNav, setMobileNav] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/transactions`)
      .then(r => { if (!r.ok) throw new Error('API unavailable'); return r.json() })
      .then(data => { if (Array.isArray(data) && data.length) { setTransactions(data.map(withMetrics)); setBackend('connected') } })
      .catch(() => setBackend('demo'))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = transactions
    if (period === 'Last 7 days') rows = rows.slice(-7)
    if (period === 'Last 14 days') rows = rows.slice(-14)
    if (q) rows = rows.filter(r => [r.order_id, r.customer, r.product, r.category].some(v => String(v || '').toLowerCase().includes(q)))
    return rows
  }, [transactions, search, period])

  const metrics = useMemo(() => {
    const revenue = filtered.reduce((s, r) => s + r.revenue, 0)
    const profit = filtered.reduce((s, r) => s + r.profit, 0)
    const orders = new Set(filtered.map(r => r.order_id)).size
    const customers = new Set(filtered.map(r => r.customer)).size
    return { revenue, profit, orders, customers, margin: revenue ? profit / revenue * 100 : 0 }
  }, [filtered])

  const daily = useMemo(() => {
    const byDate = {}
    filtered.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + r.revenue })
    const entries = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
    return { labels: entries.map(([d]) => new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })), values: entries.map(([,v]) => v) }
  }, [filtered])

  const categoryData = useMemo(() => {
    const sums = {}
    filtered.forEach(r => { sums[r.category || 'Other'] = (sums[r.category || 'Other'] || 0) + r.revenue })
    return Object.entries(sums).sort((a,b) => b[1]-a[1])
  }, [filtered])

  const products = useMemo(() => {
    const sums = {}
    filtered.forEach(r => { sums[r.product] = (sums[r.product] || 0) + r.revenue })
    return Object.entries(sums).sort((a,b) => b[1]-a[1]).slice(0,5)
  }, [filtered])

  const lineData = {
    labels: daily.labels,
    datasets: [{ label: 'Revenue', data: daily.values, fill: true, borderColor: '#6558f5', backgroundColor: ctx => {
      const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250); g.addColorStop(0, 'rgba(101,88,245,.20)'); g.addColorStop(1, 'rgba(101,88,245,0)'); return g
    }, tension: .38, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: '#6558f5', borderWidth: 2.5 }]
  }
  const doughnutData = {
    labels: categoryData.map(x => x[0]),
    datasets: [{ data: categoryData.map(x => x[1]), backgroundColor: ['#6558f5','#28b89a','#ffb454','#6bb6ff','#f17f9a'], borderWidth: 0, hoverOffset: 7 }]
  }
  const barData = {
    labels: products.map(x => x[0].length > 15 ? `${x[0].slice(0,15)}…` : x[0]),
    datasets: [{ label: 'Revenue', data: products.map(x => x[1]), backgroundColor: ['#6558f5','#8d84ff','#aaa3ff','#c1bcff','#d8d4ff'], borderRadius: 7, maxBarThickness: 28 }]
  }

  const showNotice = msg => { setNotice(msg); window.setTimeout(() => setNotice(''), 3200) }
  const exportCSV = () => {
    const cols = ['date','order_id','customer','product','category','quantity','unit_price','cost','revenue','profit']
    const csv = [cols.join(','), ...filtered.map(r => cols.map(c => `"${String(r[c] ?? '').replaceAll('"','""')}"`).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'insightboard-report.csv'; a.click(); URL.revokeObjectURL(url)
    showNotice('Your report has been exported.')
  }

  const importCSV = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const lines = text.trim().split(/\r?\n/)
      const headers = lines.shift().split(',').map(s => s.trim().replace(/^"|"$/g,''))
      const rows = lines.filter(Boolean).map((line, i) => {
        const values = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.filter(Boolean).map(v => v.replace(/,$/,'').trim().replace(/^"|"$/g,'').replaceAll('""','"')) || line.split(',')
        const obj = Object.fromEntries(headers.map((h,j) => [h, values[j] ?? '']))
        return { ...obj, id: Date.now()+i, quantity: Number(obj.quantity), unit_price: Number(obj.unit_price), cost: Number(obj.cost) }
      }).filter(r => r.date && r.product && Number.isFinite(r.quantity) && Number.isFinite(r.unit_price))
      if (!rows.length) throw new Error('No valid rows found. Check the CSV columns.')
      if (backend === 'connected') {
        const response = await fetch(`${API}/transactions/import`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(rows) })
        if (!response.ok) throw new Error('Database import failed')
        const saved = await response.json(); setTransactions(saved.map(withMetrics))
      } else setTransactions(rows.map(withMetrics))
      showNotice(`${rows.length} rows imported successfully.`)
    } catch (e) { showNotice(e.message || 'Could not import this file.') }
    event.target.value = ''
  }

  const title = active === 'Overview' ? 'Business overview' : active
  const subtitle = active === 'Overview' ? 'Here’s what’s happening with your business today.' : `Explore your business ${active.toLowerCase()} in one place.`
  const metricCards = [
    { label:'Total revenue', value:money(metrics.revenue), change:'+12.8%', icon:Wallet, color:'purple', note:'vs. previous period' },
    { label:'Total orders', value:metrics.orders.toLocaleString(), change:'+8.2%', icon:ShoppingBag, color:'mint', note:'vs. previous period' },
    { label:'Customers', value:metrics.customers.toLocaleString(), change:'+5.4%', icon:Users, color:'orange', note:'unique customers' },
    { label:'Net profit', value:money(metrics.profit), change:`${metrics.margin.toFixed(1)}%`, icon:Zap, color:'blue', note:'profit margin' }
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Activity size={21}/></div><span>insight<span className="brand-light">board</span></span><button className="close-nav" onClick={()=>setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace"><div className="workspace-avatar">N</div><div><b>Northstar Studio</b><small>Business workspace</small></div><ChevronDown size={16}/></button>
        <div className="nav-label">MENU</div>
        <nav>{navItems.map(item => <button key={item.label} onClick={()=>{setActive(item.label);setMobileNav(false)}} className={`nav-link ${active===item.label?'active':''}`}><item.icon size={18}/><span>{item.label}</span>{item.label==='Reports' && <span className="nav-count">3</span>}</button>)}</nav>
        <div className="sidebar-divider"/>
        <div className="nav-label">PREFERENCES</div>
        <button className="nav-link" onClick={()=>showNotice('Settings are ready to configure in a future version.')}><Settings2 size={18}/><span>Settings</span></button>
        <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><b>Make data your superpower</b><p>Turn everyday numbers into your next big decision.</p><button onClick={()=>showNotice('You are using the InsightBoard demo workspace.')}>Explore insights <ArrowUpRight size={14}/></button><div className="upgrade-orb orb-one"/><div className="upgrade-orb orb-two"/></div><div className="profile"><div className="profile-avatar">ST</div><div className="profile-text"><b>Sakshi T.</b><small>Admin account</small></div><MoreHorizontal size={20}/></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div></div><div className="top-actions"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></div><button className="icon-button notification" onClick={()=>showNotice('You’re all caught up!')} aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">ST</div></div></header>

        <div className="page-content">
          <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR BUSINESS AT A GLANCE</div><h1>{title}<span className="title-period">.</span></h1><p>{subtitle}</p></div><div className="welcome-actions"><label className="period-select"><CalendarDays size={16}/><select value={period} onChange={e=>setPeriod(e.target.value)}><option>This month</option><option>Last 7 days</option><option>Last 14 days</option></select><ChevronDown size={14}/></label><button className="primary-button" onClick={()=>fileRef.current?.click()}><CloudUpload size={17}/> Import data</button><input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCSV}/></div></section>

          <section className="insight-banner"><div className="banner-icon"><Sparkles size={20}/></div><div className="banner-copy"><b>Your business is moving in the right direction</b><p>You're tracking <strong>{metrics.orders} orders</strong> and <strong>{money(metrics.revenue)}</strong> in revenue for the selected period. Keep an eye on your best-performing categories.</p></div><div className="banner-decoration"><div className="banner-ring ring-a"/><div className="banner-ring ring-b"/><div className="banner-spark">✦</div></div><button className="banner-close" onClick={e=>e.currentTarget.parentElement.style.display='none'} aria-label="Dismiss insight"><X size={16}/></button></section>

          <section className="section-heading"><div><h2>Performance snapshot</h2><p>Your key metrics, all in one view</p></div><span className={`connection-pill ${backend==='connected'?'connected':''}`}><span/> {backend==='connected'?'Database connected':'Demo data'}</span></section>
          <section className="metric-grid">{metricCards.map((m,i)=><article className="metric-card" key={m.label}><div className="metric-top"><div className={`metric-icon ${m.color}`}><m.icon size={19}/></div><button className="more-button" onClick={()=>showNotice(`${m.label}: ${m.value}`)} aria-label={`More about ${m.label}`}><MoreHorizontal size={19}/></button></div><div className="metric-label">{m.label}</div><div className="metric-value">{m.value}</div><div className="metric-footer"><span className={`change-chip ${i===3?'neutral':''}`}>{i===3?<Activity size={13}/>:<ArrowUpRight size={14}/>} {m.change}</span><span>{m.note}</span></div><div className={`metric-sheen ${m.color}`}/></article>)}</section>

          <section className="chart-grid"><article className="panel revenue-panel"><div className="panel-heading"><div><h3>Revenue over time</h3><p>Track how your business performs</p></div><button className="select-small" onClick={()=>showNotice('Showing revenue for: '+period)}>{period}<ChevronDown size={14}/></button></div><div className="chart-legend"><span className="legend-dot purple-dot"/> Revenue <span className="chart-total">{money(metrics.revenue)}</span></div><div className="line-chart"><Line data={lineData} options={{...chartDefaults, interaction:{intersect:false,mode:'index'}, scales:{...chartDefaults.scales,y:{...chartDefaults.scales.y,ticks:{...chartDefaults.scales.y.ticks,callback:v=>`₹${Number(v).toLocaleString('en-IN')}`}}}}}/></div><div className="chart-foot"><span><span className="tiny-dot"/> Daily revenue</span><span>Values in INR</span></div></article>
            <article className="panel category-panel"><div className="panel-heading"><div><h3>Revenue by category</h3><p>Where your sales come from</p></div><button className="more-button" onClick={()=>showNotice('Category breakdown based on current data.')}><MoreHorizontal size={19}/></button></div><div className="donut-wrap"><Doughnut data={doughnutData} options={{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:chartDefaults.plugins.tooltip}}}/><div className="donut-center"><small>Total revenue</small><b>{money(metrics.revenue)}</b></div></div><div className="category-legend">{categoryData.slice(0,4).map((c,i)=><div key={c[0]}><span className="cat-name"><i style={{background:['#6558f5','#28b89a','#ffb454','#6bb6ff'][i]}}/>{c[0]}</span><b>{metrics.revenue?Math.round(c[1]/metrics.revenue*100):0}%</b></div>)}</div></article></section>

          <section className="lower-grid"><article className="panel products-panel"><div className="panel-heading"><div><h3>Top performing products</h3><p>Products driving the most revenue</p></div><button className="text-link" onClick={()=>setActive('Analytics')}>View analytics <ArrowUpRight size={14}/></button></div><div className="bar-chart"><Bar data={barData} options={{...chartDefaults,indexAxis:'y',scales:{x:{...chartDefaults.scales.y,ticks:{...chartDefaults.scales.y.ticks,callback:v=>`₹${v}`}},y:{...chartDefaults.scales.x,ticks:{...chartDefaults.scales.x,tickLength:0}}}}}/></div></article>
            <article className="panel goal-panel"><div className="panel-heading"><div><h3>Monthly target</h3><p>Revenue goal progress</p></div><div className="goal-badge"><Zap size={14}/> On track</div></div><div className="goal-amount"><b>{money(metrics.revenue)}</b><span>of ₹50,000</span></div><div className="progress-track"><div style={{width:`${Math.min(100,metrics.revenue/50000*100)}%`}}/></div><div className="progress-meta"><span>{Math.min(100,Math.round(metrics.revenue/50000*100))}% completed</span><span>{money(Math.max(0,50000-metrics.revenue))} to go</span></div><div className="goal-note"><div><Check size={15}/></div><p><b>Keep up the momentum!</b><br/>Every order brings you closer to your monthly goal.</p></div><div className="goal-graphic"><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/><div/></div></article></section>

          <section className="panel transactions-panel"><div className="panel-heading transaction-heading"><div><h3>Recent transactions</h3><p>A closer look at your latest business activity</p></div><div className="table-actions"><span className="row-count">{filtered.length} records</span><button className="export-button" onClick={exportCSV}><Download size={15}/> Export CSV</button></div></div><div className="table-scroll"><table><thead><tr><th>ORDER</th><th>PRODUCT</th><th>CUSTOMER</th><th>CATEGORY</th><th>DATE</th><th>REVENUE</th><th>PROFIT</th></tr></thead><tbody>{filtered.slice(0,7).map(r=><tr key={r.id ?? r.order_id}><td><span className="order-id">{r.order_id}</span></td><td><div className="product-cell"><div className="product-symbol"><Package size={15}/></div><b>{r.product}</b></div></td><td><span className="customer-cell">{r.customer}</span></td><td><span className={`category-tag ${String(r.category).toLowerCase().replace(/[^a-z]/g,'')}`}>{r.category}</span></td><td className="date-cell">{new Date(`${r.date}T12:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td><td className="money-cell">{money(r.revenue)}</td><td className="profit-cell">{money(r.profit)}</td></tr>)}</tbody></table>{!filtered.length&&<div className="empty-state">No transactions match your search. Try another keyword.</div>}</div><div className="table-bottom"><span>Showing <b>{Math.min(7,filtered.length)}</b> of <b>{filtered.length}</b> transactions</span><button onClick={()=>setActive('Transactions')}>View all transactions <ArrowUpRight size={14}/></button></div></section>

          <footer className="footer"><span>© 2026 InsightBoard Analytics</span><span><i className="footer-status"/> All systems operational</span><span>Made for smarter decisions <Sparkles size={13}/></span></footer>
        </div>
      </main>
      {mobileNav&&<button className="mobile-scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
      {notice&&<div className="toast"><div><Check size={16}/></div>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
    </div>
  )
}

export default App
