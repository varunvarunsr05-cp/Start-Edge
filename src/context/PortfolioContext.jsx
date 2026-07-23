import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const PortfolioContext = createContext(null);
const STORAGE_KEY = "stockstrategist_portfolio";
const STARTING_CASH = 100000; // ₹1,00,000 virtual paper-trading balance

export function PortfolioProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : { cash: STARTING_CASH, holdings: [], history: [] };
    } catch {
      return { cash: STARTING_CASH, holdings: [], history: [] };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // fail silently if storage is unavailable
    }
  }, [state]);

  const buy = useCallback((symbol, price, quantity) => {
    const cost = price * quantity;
    setState((prev) => {
      if (cost > prev.cash) return prev; // insufficient paper funds, no-op
      const existing = prev.holdings.find((h) => h.symbol === symbol);
      const holdings = existing
        ? prev.holdings.map((h) =>
            h.symbol === symbol
              ? {
                  ...h,
                  quantity: h.quantity + quantity,
                  avgPrice:
                    (h.avgPrice * h.quantity + cost) / (h.quantity + quantity),
                }
              : h
          )
        : [...prev.holdings, { symbol, quantity, avgPrice: price }];

      return {
        cash: prev.cash - cost,
        holdings,
        history: [
          { type: "buy", symbol, price, quantity, date: new Date().toISOString() },
          ...prev.history,
        ],
      };
    });
  }, []);

  const sell = useCallback((symbol, price, quantity) => {
    setState((prev) => {
      const existing = prev.holdings.find((h) => h.symbol === symbol);
      if (!existing || existing.quantity < quantity) return prev; // no-op if not enough shares

      const remaining = existing.quantity - quantity;
      const holdings =
        remaining > 0
          ? prev.holdings.map((h) =>
              h.symbol === symbol ? { ...h, quantity: remaining } : h
            )
          : prev.holdings.filter((h) => h.symbol !== symbol);

      return {
        cash: prev.cash + price * quantity,
        holdings,
        history: [
          { type: "sell", symbol, price, quantity, date: new Date().toISOString() },
          ...prev.history,
        ],
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ cash: STARTING_CASH, holdings: [], history: [] });
  }, []);

  const value = useMemo(
    () => ({ ...state, startingCash: STARTING_CASH, buy, sell, reset }),
    [state, buy, sell, reset]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
