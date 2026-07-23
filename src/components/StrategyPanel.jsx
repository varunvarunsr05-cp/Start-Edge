import { useMemo, useState } from "react";
import { STRATEGIES, runStrategy, backtest } from "../utils/strategyEngine";

export default function StrategyPanel({ candles }) {
  const [strategyId, setStrategyId] = useState("goldenCross");

  const result = useMemo(() => {
    const signals = runStrategy(strategyId, candles);
    return { signals, stats: backtest(signals, candles) };
  }, [strategyId, candles]);

  const { signals, stats } = result;
  const latestSignal = signals[signals.length - 1];
  const strategy = STRATEGIES[strategyId];

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-mono font-bold text-sm text-ink">Strategy Backtest</h2>
        <select
          value={strategyId}
          onChange={(e) => setStrategyId(e.target.value)}
          className="text-xs bg-bg border border-line rounded-md px-2 py-1.5 text-ink font-mono focus:outline-none focus:ring-2 focus:ring-green"
        >
          {Object.values(STRATEGIES).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-subtle mb-5">{strategy.description}</p>

      {/* Win rate — the headline number */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
          tone={stats.winRate >= 50 ? "green" : "red"}
          emphasis
        />
        <StatCard
          label="Avg Return / Trade"
          value={`${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn.toFixed(2)}%`}
          tone={stats.avgReturn >= 0 ? "green" : "red"}
        />
        <StatCard label="Total Trades" value={stats.totalTrades} />
        <StatCard
          label="Avg Holding Period"
          value={`${Math.round(stats.avgHoldingDays)}d`}
        />
      </div>

      {stats.totalTrades === 0 && (
        <p className="text-xs text-subtle bg-bg border border-line rounded-md p-3 mb-4">
          No completed trades in this data range for this strategy — try a
          different strategy or a stock with more price history.
        </p>
      )}

      {latestSignal && (
        <div
          className={`rounded-md p-3 mb-4 border ${
            latestSignal.type === "buy"
              ? "bg-green/10 border-green/30"
              : "bg-red/10 border-red/30"
          }`}
        >
          <p className="text-xs text-subtle mb-0.5">Most recent signal</p>
          <p
            className={`font-mono font-bold text-sm ${
              latestSignal.type === "buy" ? "text-green" : "text-red"
            }`}
          >
            {latestSignal.type === "buy" ? "▲ BUY" : "▼ SELL"} on{" "}
            {new Date(latestSignal.date).toLocaleDateString("en-IN")}
          </p>
          <p className="text-xs text-subtle mt-1">{latestSignal.reason}</p>
        </div>
      )}

      {stats.bestTrade && stats.worstTrade && (
        <div className="grid sm:grid-cols-2 gap-3">
          <TradeCard label="Best trade" trade={stats.bestTrade} tone="green" />
          <TradeCard label="Worst trade" trade={stats.worstTrade} tone="red" />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone, emphasis }) {
  const toneClass =
    tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-ink";
  return (
    <div className="bg-bg border border-line rounded-md p-3">
      <p className="text-[11px] text-subtle mb-1">{label}</p>
      <p
        className={`font-mono font-bold tabular ${toneClass} ${
          emphasis ? "text-xl" : "text-base"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TradeCard({ label, trade, tone }) {
  const toneClass = tone === "green" ? "text-green" : "text-red";
  return (
    <div className="bg-bg border border-line rounded-md p-3">
      <p className="text-[11px] text-subtle mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm tabular ${toneClass}`}>
        {trade.returnPct >= 0 ? "+" : ""}
        {trade.returnPct.toFixed(2)}%
      </p>
      <p className="text-[11px] text-subtle mt-1">
        {new Date(trade.entryDate).toLocaleDateString("en-IN")} →{" "}
        {new Date(trade.exitDate).toLocaleDateString("en-IN")} (
        {trade.holdingDays}d)
      </p>
    </div>
  );
}
