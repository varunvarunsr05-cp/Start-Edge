# StratEdge — NSE Stock Strategy Backtester

Vite + React + Tailwind CSS (no TypeScript). Bloomberg-terminal-style dashboard for historical technical analysis and strategy backtesting on Indian NSE stocks.

Educational tool only — not financial advice. Every strategy shown is a historical backtest, not a prediction.

## No API key needed

This app pulls data from Yahoo Finance's public chart endpoint (via a free CORS proxy), so there's nothing to sign up for or paste anywhere.

## Run it

npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build

## Features

- Live NSE price data for any ticker (RELIANCE, TCS, INFY, etc.) via Yahoo Finance.
- Technical indicators: SMA, EMA, RSI, MACD, Bollinger Bands — all computed client-side.
- Strategy backtesting: Golden Cross, RSI Reversal, MACD Crossover — each shows win rate %, average return per trade, average holding period, and best/worst trades.
- Historical time-window patterns: which weekdays have historically shown the best average returns / most volatility for a given stock (descriptive, not predictive).
- Nifty 50 benchmark comparison, indexed to a common base for fair visual comparison.
- Watchlist, persisted in localStorage.
- Paper trading portfolio (₹1,00,000 virtual starting cash), persisted in localStorage — buy/sell simulated positions and track total return over time.
- Permanent risk disclaimer banner.
- Code-split, lazy-loaded chart panels for a fast initial load.

## Structure

src/
  api/
    stockApi.js              Yahoo Finance calls (via CORS proxy), normalized data shape
  utils/
    indicators.js            SMA, EMA, RSI, MACD, Bollinger Band math
    strategyEngine.js        Strategy signal generation + backtesting + win rate
  context/
    WatchlistContext.jsx     localStorage-backed watchlist
    PortfolioContext.jsx     localStorage-backed paper trading portfolio
  components/
    Sidebar.jsx              Ticker search, popular list, watchlist
    DisclaimerBanner.jsx
    StockHeader.jsx          Price, change %, day/period high-low
    PriceChart.jsx           Main price chart with SMA/Bollinger overlays
    IndicatorPanels.jsx      RSI panel + MACD panel
    StrategyPanel.jsx        Strategy selector + win rate / backtest results
    TimeWindowPanel.jsx      Best/worst weekday historical stats
    BenchmarkPanel.jsx       Stock vs Nifty 50 comparison
    PortfolioPanel.jsx       Paper trading buy/sell UI
    DashboardSkeleton.jsx    Loading state

## Notes on the data source

- Yahoo Finance doesn't officially publish an API and doesn't send CORS headers for browser
  requests, so this app routes through a free public CORS proxy (allorigins.win). That proxy
  has a modest rate limit (~20 requests/minute) — if you hit it, wait a few seconds and retry.
- If the free proxy ever goes down, swap the `CORS_PROXY` constant at the top of
  `src/api/stockApi.js` for an alternative (e.g. corsfix.com or api.codetabs.com/v1/proxy/?quest=).

## Deploying to Vercel

Push to a GitHub repo, then import in Vercel — it auto-detects Vite, no config needed.
