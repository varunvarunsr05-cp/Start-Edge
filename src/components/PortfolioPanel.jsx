import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export default function PortfolioPanel({ symbol, currentPrice }) {
  const { cash, holdings, startingCash, buy, sell, reset } = usePortfolio();
  const [qty, setQty] = useState(1);

  const holding = holdings.find((h) => h.symbol === symbol);
  const holdingsValue = holdings.reduce((sum, h) => {
    // We only know the live price for the currently loaded symbol;
    // other holdings are valued at their average cost as a stable fallback.
    const price = h.symbol === symbol ? currentPrice : h.avgPrice;
    return sum + price * h.quantity;
  }, 0);
  const totalValue = cash + holdingsValue;
  const totalReturn = ((totalValue - startingCash) / startingCash) * 100;

  const handleBuy = () => {
    if (qty > 0) buy(symbol, currentPrice, qty);
  };
  const handleSell = () => {
    if (qty > 0 && holding && holding.quantity >= qty) sell(symbol, currentPrice, qty);
  };

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono font-bold text-sm text-ink">
          Paper Trading Portfolio
        </h2>
        <button
          onClick={reset}
          className="text-xs text-subtle hover:text-red transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-bg border border-line rounded-md p-3">
          <p className="text-[11px] text-subtle mb-1">Cash</p>
          <p className="font-mono font-bold text-ink tabular">
            ₹{cash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-bg border border-line rounded-md p-3">
          <p className="text-[11px] text-subtle mb-1">Total Value</p>
          <p className="font-mono font-bold text-ink tabular">
            ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-bg border border-line rounded-md p-3">
          <p className="text-[11px] text-subtle mb-1">Total Return</p>
          <p
            className={`font-mono font-bold tabular ${
              totalReturn >= 0 ? "text-green" : "text-red"
            }`}
          >
            {totalReturn >= 0 ? "+" : ""}
            {totalReturn.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <div className="flex-1">
          <label className="text-[11px] text-subtle mb-1 block">
            Quantity ({symbol})
          </label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 bg-bg border border-line rounded-md text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>
        <button
          onClick={handleBuy}
          disabled={currentPrice * qty > cash}
          className="px-4 py-2 rounded-md bg-green text-bg font-bold text-sm hover:bg-greenDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          disabled={!holding || holding.quantity < qty}
          className="px-4 py-2 rounded-md bg-red/90 text-bg font-bold text-sm hover:bg-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sell
        </button>
      </div>

      {holding && (
        <p className="text-xs text-subtle">
          Current holding: <span className="text-ink font-mono">{holding.quantity}</span>{" "}
          shares @ avg ₹{holding.avgPrice.toFixed(2)}
        </p>
      )}
    </div>
  );
}
