// Data source: Yahoo Finance's public chart endpoint (no API key required).
// Yahoo doesn't send CORS headers for browser requests, so we route through
// a free public CORS proxy (allorigins.win) to make the request work client-side.

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export class StockApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function buildProxiedUrl(targetUrl) {
  // return `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
  const CORS_PROXY = "https://api.codetabs.com/v1/proxy/?quest=";
}

/**
 * Fetches historical daily OHLC data for an Indian NSE stock.
 * symbol should be the NSE ticker without suffix, e.g. "RELIANCE", "TCS", "INFY".
 * We append ".NS" automatically (index symbols like NSEI are passed through as-is).
 */
export async function getHistoricalData(symbol, range = "1y") {
  const isIndex = symbol.toUpperCase() === "NSEI" || symbol.toUpperCase() === "^NSEI";
  const ticker = isIndex
    ? "%5ENSEI" // Yahoo's symbol for the Nifty 50 index is ^NSEI
    : symbol.toUpperCase().endsWith(".NS")
    ? symbol.toUpperCase()
    : `${symbol.toUpperCase()}.NS`;

  const yahooUrl = `${YAHOO_BASE}/${ticker}?range=${range}&interval=1d&includePrePost=false`;
  const url = buildProxiedUrl(yahooUrl);

  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new StockApiError(
      "Couldn't reach the data provider. Check your connection and try again.",
      "NETWORK"
    );
  }

  if (!res.ok) {
    throw new StockApiError(
      `Couldn't load data for "${symbol}". Check the ticker symbol (e.g. RELIANCE, TCS, INFY).`,
      "NOT_FOUND"
    );
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];

  if (!result || !result.timestamp) {
    const yahooError = data?.chart?.error?.description;
    throw new StockApiError(
      yahooError || `No historical data found for "${symbol}". Check the ticker symbol.`,
      "EMPTY"
    );
  }

  const { timestamp, indicators, meta } = result;
  const quote = indicators.quote[0];

  const candles = timestamp
    .map((ts, i) => {
      // Some days can have null OHLC values (holidays/partial data) — skip those.
      if (
        quote.open[i] == null ||
        quote.high[i] == null ||
        quote.low[i] == null ||
        quote.close[i] == null
      ) {
        return null;
      }
      return {
        date: new Date(ts * 1000).toISOString().split("T")[0],
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i] || 0,
      };
    })
    .filter(Boolean);

  if (candles.length === 0) {
    throw new StockApiError(
      `No usable historical data found for "${symbol}".`,
      "EMPTY"
    );
  }

  return {
    meta: {
      symbol: meta.symbol,
      currency: meta.currency,
      exchange: meta.exchangeName,
    },
    candles,
  };
}

/**
 * Lightweight symbol search using Yahoo's search endpoint, filtered to NSE results.
 */
export async function searchSymbol(query) {
  const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    query
  )}&quotesCount=8&newsCount=0`;
  const url = buildProxiedUrl(yahooUrl);

  let res;
  try {
    res = await fetch(url);
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const data = await res.json();
  const quotes = data?.quotes || [];

  return quotes
    .filter((q) => q.exchange === "NSI" || (q.symbol || "").endsWith(".NS"))
    .map((q) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      exchange: q.exchange,
    }));
}
