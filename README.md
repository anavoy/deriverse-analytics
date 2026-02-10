## Getting Started

run the development server:

```bash
npm run devev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



# Deriverse Trading Analytics

Professional trading analytics dashboard and journal built for the Deriverse ecosystem.

---

## Overview

Deriverse Trading Analytics is a client-side trading journal and portfolio analytics dashboard designed for active traders.  
It provides detailed performance, risk, and behavioral insights based on historical trade data.

All analytics are performed locally in the browser. No trade data is sent to any backend or third-party service.

---

## Features

### Performance Analytics
- Total net and gross PnL tracking
- Equity curve with drawdown visualization
- Win rate and total trade count
- Largest gain and largest loss
- Average win and average loss
- Profit factor and expectancy

### Risk & Behavior
- Long vs Short trade distribution
- PnL and win rate by direction
- Average trade duration
- Order type performance analysis

### Time-Based Analysis
- Daily PnL performance
- Hour-of-day performance
- Session-based performance (Asia / London / New York)

### Fees & Costs
- Total cumulative fees
- Fees over time
- Fees as a percentage of gross PnL

### Trade Journal
- Detailed trade history table
- Symbol and date range filtering
- Per-trade annotations and notes
- Exportable filtered trade data

---

## Supported CSV Format

The dashboard supports CSV files with the following columns:

```csv
trade_id
symbol
side
open_time
close_time
entry_price
exit_price
size
fees
order_type



# Metrics 
PnL
LONG: (exit_price - entry_price) * size
SHORT: (entry_price - exit_price) * size
Net PnL = Gross PnL − fees

Drawdown Calculations
Calculated as the difference between current equity and historical peak equity.

Trade Duration
close_time − open_time

Profit Factor
Total winning PnL ÷ total losing PnL


# Security & Privacy
No wallet connection required
No private keys handled
No backend or server-side storage
All calculations performed locally in the browser
CSV parsing uses strict schema validation


# Limitations & Assumptions
Funding rates and slippage are not included unless present in the CSV
Each trade is assumed to be fully closed (no partial closes)
Time-based session analysis uses UTC time

Running Locally
npm install
npm run dev
