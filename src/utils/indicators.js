/**
 * All functions take an array of candle objects ({date, open, high, low, close, volume})
 * sorted oldest-first, and return an array of the same length aligned by index,
 * with `null` for indices where there isn't enough history to compute a value yet.
 */

export function sma(candles, period) {
  const closes = candles.map((c) => c.close);
  const out = new Array(closes.length).fill(null);
  for (let i = period - 1; i < closes.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    out[i] = sum / period;
  }
  return out;
}

export function ema(candles, period) {
  const closes = candles.map((c) => c.close);
  const out = new Array(closes.length).fill(null);
  const k = 2 / (period + 1);
  let prevEma = null;

  for (let i = 0; i < closes.length; i++) {
    if (i === period - 1) {
      // seed with SMA of the first `period` closes
      let sum = 0;
      for (let j = 0; j <= i; j++) sum += closes[j];
      prevEma = sum / period;
      out[i] = prevEma;
    } else if (i >= period) {
      prevEma = closes[i] * k + prevEma * (1 - k);
      out[i] = prevEma;
    }
  }
  return out;
}

export function rsi(candles, period = 14) {
  const closes = candles.map((c) => c.close);
  const out = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return out;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return out;
}

export function macd(candles, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(candles, fast);
  const emaSlow = ema(candles, slow);

  const macdLine = candles.map((_, i) =>
    emaFast[i] !== null && emaSlow[i] !== null ? emaFast[i] - emaSlow[i] : null
  );

  // Signal line = EMA of the MACD line itself, computed only over valid values
  const validStart = macdLine.findIndex((v) => v !== null);
  const signalLine = new Array(candles.length).fill(null);

  if (validStart !== -1) {
    const k = 2 / (signalPeriod + 1);
    let prev = null;
    for (let i = validStart; i < macdLine.length; i++) {
      const idxInValid = i - validStart;
      if (idxInValid === signalPeriod - 1) {
        let sum = 0;
        for (let j = validStart; j <= i; j++) sum += macdLine[j];
        prev = sum / signalPeriod;
        signalLine[i] = prev;
      } else if (idxInValid >= signalPeriod) {
        prev = macdLine[i] * k + prev * (1 - k);
        signalLine[i] = prev;
      }
    }
  }

  const histogram = candles.map((_, i) =>
    macdLine[i] !== null && signalLine[i] !== null ? macdLine[i] - signalLine[i] : null
  );

  return { macdLine, signalLine, histogram };
}

export function bollingerBands(candles, period = 20, stdDevMultiplier = 2) {
  const closes = candles.map((c) => c.close);
  const middle = sma(candles, period);
  const upper = new Array(closes.length).fill(null);
  const lower = new Array(closes.length).fill(null);

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = middle[i];
    const variance =
      slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    upper[i] = mean + stdDevMultiplier * stdDev;
    lower[i] = mean - stdDevMultiplier * stdDev;
  }

  return { middle, upper, lower };
}
