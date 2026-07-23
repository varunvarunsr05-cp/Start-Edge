export default function StockHeader({ symbol, meta, candles }) {
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const change = previous ? latest.close - previous.close : 0;
  const changePct = previous ? (change / previous.close) * 100 : 0;
  const isUp = change >= 0;

  const high52w = Math.max(...candles.map((c) => c.high));
  const low52w = Math.min(...candles.map((c) => c.low));

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-bold text-xl text-ink">{symbol}</h1>
            <span className="text-xs text-subtle">
              {meta?.exchange || "NSE"} · {meta?.currency || "INR"}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-mono text-3xl font-bold text-ink tabular">
              ₹{latest.close.toFixed(2)}
            </span>
            <span
              className={`font-mono text-sm font-semibold tabular ${
                isUp ? "text-green" : "text-red"
              }`}
            >
              {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)} (
              {Math.abs(changePct).toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex gap-6 text-xs">
          <div>
            <p className="text-subtle mb-0.5">Day Open</p>
            <p className="font-mono text-ink tabular">₹{latest.open.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-subtle mb-0.5">Day High</p>
            <p className="font-mono text-ink tabular">₹{latest.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-subtle mb-0.5">Day Low</p>
            <p className="font-mono text-ink tabular">₹{latest.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-subtle mb-0.5">Period High</p>
            <p className="font-mono text-ink tabular">₹{high52w.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-subtle mb-0.5">Period Low</p>
            <p className="font-mono text-ink tabular">₹{low52w.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
