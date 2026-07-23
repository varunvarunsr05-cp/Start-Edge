import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const WatchlistContext = createContext(null);
const STORAGE_KEY = "stockstrategist_watchlist";

export function WatchlistProvider({ children }) {
  const [symbols, setSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
    } catch {
      // localStorage unavailable (private browsing, quota) — fail silently, in-memory state still works
    }
  }, [symbols]);

  const addSymbol = useCallback((symbol) => {
    setSymbols((prev) =>
      prev.includes(symbol) ? prev : [...prev, symbol]
    );
  }, []);

  const removeSymbol = useCallback((symbol) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const value = useMemo(
    () => ({ symbols, addSymbol, removeSymbol }),
    [symbols, addSymbol, removeSymbol]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
