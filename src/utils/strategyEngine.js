import { sma, rsi, macd } from "./indicators";

/**
 * Each strategy returns an array of "signals": { index, date, type: "buy"|"sell", reason }
 * aligned to the candles array.
 */

export const STRATEGIES = {
  goldenCross: {
    id: "goldenCross",
    label: "Golden Cross (SMA 20/50)",
    description:
      "Buys when the 20-day average crosses above the 50-day average, sells on the reverse cross. A classic trend-following signal.",
  },
  rsiReversal: {
    id: "rsiReversal",
    label: "RSI Reversal (14)",
    description:
      "Buys when RSI drops below 30 (oversold) and sells when it rises above 70 (overbought).",
  },
  macdCrossover: {
    id: "macdCrossover",
    label: "MACD Crossover",
    description:
      "Buys when the MACD line crosses above its signal line, sells on the reverse cross. Captures momentum shifts.",
  },
};

export function runStrategy(strategyId, candles) {
  switch (strategyId) {
    case "goldenCross":
      return goldenCrossSignals(candles);
    case "rsiReversal":
      return rsiReversalSignals(candles);
    case "macdCrossover":
      return macdCrossoverSignals(candles);
    default:
      return [];
  }
}

function goldenCrossSignals(candles) {
  const sma20 = sma(candles, 20);
  const sma50 = sma(candles, 50);
  const signals = [];
  let lastState = null; // "above" | "below"

  for (let i = 0; i < candles.length; i++) {
    if (sma20[i] === null || sma50[i] === null) continue;
    const state = sma20[i] > sma50[i] ? "above" : "below";
    if (lastState && state !== lastState) {
      signals.push({
        index: i,
        date: candles[i].date,
        type: state === "above" ? "buy" : "sell",
        reason:
          state === "above"
            ? "20-day average crossed above 50-day average"
            : "20-day average crossed below 50-day average",
      });
    }
    lastState = state;
  }
  return signals;
}

function rsiReversalSignals(candles) {
  const rsiVals = rsi(candles, 14);
  const signals = [];
  let position = null; // "long" | null — prevents repeated buy signals while still oversold

  for (let i = 0; i < candles.length; i++) {
    if (rsiVals[i] === null) continue;
    if (rsiVals[i] < 30 && position !== "long") {
      signals.push({
        index: i,
        date: candles[i].date,
        type: "buy",
        reason: `RSI dropped to ${rsiVals[i].toFixed(1)} (oversold)`,
      });
      position = "long";
    } else if (rsiVals[i] > 70 && position === "long") {
      signals.push({
        index: i,
        date: candles[i].date,
        type: "sell",
        reason: `RSI rose to ${rsiVals[i].toFixed(1)} (overbought)`,
      });
      position = null;
    }
  }
  return signals;
}

function macdCrossoverSignals(candles) {
  const { macdLine, signalLine } = macd(candles);
  const signals = [];
  let lastState = null;

  for (let i = 0; i < candles.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) continue;
    const state = macdLine[i] > signalLine[i] ? "above" : "below";
    if (lastState && state !== lastState) {
      signals.push({
        index: i,
        date: candles[i].date,
        type: state === "above" ? "buy" : "sell",
        reason:
          state === "above"
            ? "MACD line crossed above signal line"
            : "MACD line crossed below signal line",
      });
    }
    lastState = state;
  }
  return signals;
}

/**
 * Pairs up buy→sell signals into trades and computes win rate & average return.
 * A trade is "open" from a buy signal until the next sell signal.
 * If the strategy ends still holding a position, that open trade is excluded
 * from win-rate stats (its outcome is unknown) but reported separately.
 */
export function backtest(signals, candles) {
  const trades = [];
  let openBuy = null;

  for (const signal of signals) {
    if (signal.type === "buy" && !openBuy) {
      openBuy = signal;
    } else if (signal.type === "sell" && openBuy) {
      const entryPrice = candles[openBuy.index].close;
      const exitPrice = candles[signal.index].close;
      const returnPct = ((exitPrice - entryPrice) / entryPrice) * 100;
      const holdingDays = signal.index - openBuy.index;
      trades.push({
        entryDate: openBuy.date,
        exitDate: signal.date,
        entryPrice,
        exitPrice,
        returnPct,
        holdingDays,
        win: returnPct > 0,
      });
      openBuy = null;
    }
  }

  const closedTrades = trades;
  const wins = closedTrades.filter((t) => t.win).length;
  const winRate = closedTrades.length ? (wins / closedTrades.length) * 100 : 0;
  const avgReturn =
    closedTrades.length > 0
      ? closedTrades.reduce((sum, t) => sum + t.returnPct, 0) / closedTrades.length
      : 0;
  const avgHoldingDays =
    closedTrades.length > 0
      ? closedTrades.reduce((sum, t) => sum + t.holdingDays, 0) / closedTrades.length
      : 0;
  const bestTrade = closedTrades.length
    ? closedTrades.reduce((a, b) => (a.returnPct > b.returnPct ? a : b))
    : null;
  const worstTrade = closedTrades.length
    ? closedTrades.reduce((a, b) => (a.returnPct < b.returnPct ? a : b))
    : null;

  const hasOpenPosition = openBuy !== null;

  return {
    trades: closedTrades,
    totalSignals: signals.length,
    totalTrades: closedTrades.length,
    winRate,
    avgReturn,
    avgHoldingDays,
    bestTrade,
    worstTrade,
    hasOpenPosition,
  };
}

/**
 * Historical "best time window" stats: average return by weekday,
 * purely descriptive of past behavior — not a prediction.
 */
export function weekdayVolatility(candles) {
  const buckets = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 1; i < candles.length; i++) {
    const day = new Date(candles[i].date).getDay();
    const pctChange =
      ((candles[i].close - candles[i - 1].close) / candles[i - 1].close) * 100;
    buckets[day].push(pctChange);
  }

  return labels
    .map((label, day) => {
      const values = buckets[day];
      if (!values.length) return null;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const avgAbs =
        values.reduce((a, b) => a + Math.abs(b), 0) / values.length;
      return { day: label, avgReturn: avg, avgMovement: avgAbs, sampleSize: values.length };
    })
    .filter(Boolean)
    .filter((d) => d.sampleSize > 0 && d.day !== "Sat" && d.day !== "Sun"); // NSE closed weekends
}
