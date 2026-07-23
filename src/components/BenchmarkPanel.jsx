import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { getHistoricalData, StockApiError } from "../api/stockApi";

/** Normalizes a price series to a base-100 index so two differently priced
 * instruments (e.g. a ₹2,800 stock and the ₹22,000 Nifty index) can be compared visually. */
function normalizeToBase100(candles) {
  const base = candles[0].close;
  return candles.map((c) => (c.close / base) * 100);
}

export default function BenchmarkPanel({ symbol, candles }) {
  const [niftyCandles, setNiftyCandles] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHistoricalData("NSEI", "1y")
      .then(({ candles: nc }) => {
        if (!cancelled) {
          setNiftyCandles(nc);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof StockApiError
              ? err.message
              : "Couldn't load Nifty 50 benchmark data."
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles.length]);

  if (loading) {
    return (
      <div className="bg-panel border border-line rounded-lg p-5 shadow-panel h-64 skeleton" />
    );
  }

  if (error || !niftyCandles) {
    return (
      <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
        <h2 className="font-mono font-bold text-sm text-ink mb-2">
          Benchmark vs Nifty 50
        </h2>
        <p className="text-xs text-subtle">
          {error || "Benchmark data unavailable right now."}
        </p>
      </div>
    );
  }

  const stockIndexed = normalizeToBase100(candles);
  const niftyIndexed = normalizeToBase100(niftyCandles);
  const len = Math.min(stockIndexed.length, niftyIndexed.length);

  const data = Array.from({ length: len }).map((_, i) => ({
    date: new Date(candles[candles.length - len + i].date).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short" }
    ),
    stock: stockIndexed[stockIndexed.length - len + i],
    nifty: niftyIndexed[niftyIndexed.length - len + i],
  }));

  const stockGain = (stockIndexed[stockIndexed.length - 1] - 100).toFixed(1);
  const niftyGain = (niftyIndexed[niftyIndexed.length - 1] - 100).toFixed(1);

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="font-mono font-bold text-sm text-ink">
          Benchmark vs Nifty 50
        </h2>
        <div className="flex gap-4 text-xs font-mono">
          <span className={parseFloat(stockGain) >= 0 ? "text-green" : "text-red"}>
            {symbol}: {stockGain >= 0 ? "+" : ""}
            {stockGain}%
          </span>
          <span className={parseFloat(niftyGain) >= 0 ? "text-green" : "text-red"}>
            Nifty 50: {niftyGain >= 0 ? "+" : ""}
            {niftyGain}%
          </span>
        </div>
      </div>
      <p className="text-xs text-subtle mb-4">
        Both series indexed to 100 at the start of the period for a fair
        visual comparison.
      </p>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2622" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7C8B82" }} minTickGap={50} />
            <YAxis tick={{ fontSize: 10, fill: "#7C8B82" }} width={40} />
            <Tooltip
              contentStyle={{
                background: "#101512",
                border: "1px solid #1E2622",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, name) => [v.toFixed(1), name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="stock"
              stroke="#00D68F"
              strokeWidth={2}
              dot={false}
              name={symbol}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="nifty"
              stroke="#7C8B82"
              strokeWidth={1.5}
              dot={false}
              name="Nifty 50"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
