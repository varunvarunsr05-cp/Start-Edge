import { useState } from "react";
import { useWatchlist } from "../context/WatchlistContext";

const POPULAR_TICKERS = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC", "SBIN"];

export default function Sidebar({ onSelectSymbol, currentSymbol }) {
  const [input, setInput] = useState("");
  const { symbols, addSymbol, removeSymbol } = useWatchlist();

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = input.trim().toUpperCase();
    if (clean) {
      onSelectSymbol(clean);
      setInput("");
    }
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-panel border-r border-line lg:min-h-screen lg:sticky lg:top-0">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green text-xl">▲</span>
          <span className="font-mono font-bold text-lg tracking-tight">
            StratEdge
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mb-5">
          <label className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2 block">
            NSE Ticker
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. RELIANCE"
              className="flex-1 min-w-0 px-3 py-2 rounded-md bg-bg border border-line text-ink font-mono text-sm placeholder-subtle/50 focus:outline-none focus:ring-2 focus:ring-green"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-md bg-green text-bg hover:bg-greenDark transition-colors text-sm font-bold shrink-0"
            >
              Load
            </button>
          </div>
        </form>

        <div className="mb-6">
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">
            Popular
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => onSelectSymbol(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  currentSymbol === t
                    ? "bg-green/10 border-green text-green"
                    : "border-line text-subtle hover:border-green hover:text-green"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-subtle uppercase tracking-wide">
              Watchlist
            </p>
            {currentSymbol && !symbols.includes(currentSymbol) && (
              <button
                onClick={() => addSymbol(currentSymbol)}
                className="text-xs text-green hover:underline"
              >
                + Add current
              </button>
            )}
          </div>
          {symbols.length === 0 ? (
            <p className="text-xs text-subtle">No saved tickers yet.</p>
          ) : (
            <ul className="space-y-1">
              {symbols.map((s) => (
                <li key={s} className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectSymbol(s)}
                    className={`flex-1 text-left px-2.5 py-1.5 rounded-md text-sm font-mono transition-colors ${
                      currentSymbol === s
                        ? "bg-green/10 text-green"
                        : "text-ink hover:bg-bg"
                    }`}
                  >
                    {s}
                  </button>
                  <button
                    onClick={() => removeSymbol(s)}
                    aria-label={`Remove ${s} from watchlist`}
                    className="text-subtle hover:text-red text-xs px-1.5"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
