import { useState, useCallback, Suspense, lazy } from "react";
import { WatchlistProvider } from "./context/WatchlistContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import Sidebar from "./components/Sidebar";
import DisclaimerBanner from "./components/DisclaimerBanner";
import DashboardSkeleton from "./components/DashboardSkeleton";
import StockHeader from "./components/StockHeader";
import { getHistoricalData, StockApiError } from "./api/stockApi";

// Recharts-backed panels are code-split so the initial bundle stays light.
const PriceChart = lazy(() => import("./components/PriceChart"));
const RsiPanel = lazy(() =>
  import("./components/IndicatorPanels").then((m) => ({ default: m.RsiPanel }))
);
const MacdPanel = lazy(() =>
  import("./components/IndicatorPanels").then((m) => ({ default: m.MacdPanel }))
);
const StrategyPanel = lazy(() => import("./components/StrategyPanel"));
const TimeWindowPanel = lazy(() => import("./components/TimeWindowPanel"));
const BenchmarkPanel = lazy(() => import("./components/BenchmarkPanel"));
const PortfolioPanel = lazy(() => import("./components/PortfolioPanel"));

function ChartFallback() {
  return <div className="h-64 bg-panel border border-line rounded-lg skeleton" />;
}

function AppContent() {
  const [symbol, setSymbol] = useState(null);
  const [candles, setCandles] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectSymbol = useCallback(async (sym) => {
    setLoading(true);
    setError(null);
    setSymbol(sym);
    try {
      const { meta: m, candles: c } = await getHistoricalData(sym);
      setMeta(m);
      setCandles(c);
    } catch (err) {
      setCandles(null);
      setError(
        err instanceof StockApiError
          ? err.message
          : "Something went wrong loading this stock. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      <Sidebar onSelectSymbol={handleSelectSymbol} currentSymbol={symbol} />

      <div className="flex-1 flex flex-col min-w-0">
        <DisclaimerBanner />

        <main className="flex-1 p-5 lg:p-6 max-w-6xl w-full mx-auto">
          {!symbol && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-24">
              <p className="text-5xl mb-4">📈</p>
              <h1 className="font-mono text-lg font-bold text-ink mb-1">
                Enter an NSE ticker to begin
              </h1>
              <p className="text-sm text-subtle max-w-sm">
                Try RELIANCE, TCS, or INFY — or pick from the popular list in
                the sidebar.
              </p>
            </div>
          )}

          {loading && <DashboardSkeleton />}

          {error && (
            <div className="bg-panel border border-red/30 rounded-lg p-6 text-center">
              <p className="text-3xl mb-2">⚠️</p>
              <p className="text-ink font-semibold text-sm">{error}</p>
            </div>
          )}

          {symbol && candles && !loading && !error && (
            <div className="space-y-5">
              <StockHeader symbol={symbol} meta={meta} candles={candles} />

              <Suspense fallback={<ChartFallback />}>
                <PriceChart candles={candles} />
              </Suspense>

              <Suspense fallback={<ChartFallback />}>
                <div className="grid md:grid-cols-2 gap-5">
                  <RsiPanel candles={candles} />
                  <MacdPanel candles={candles} />
                </div>
              </Suspense>

              <Suspense fallback={<ChartFallback />}>
                <StrategyPanel candles={candles} />
              </Suspense>

              <div className="grid md:grid-cols-2 gap-5">
                <Suspense fallback={<ChartFallback />}>
                  <TimeWindowPanel candles={candles} />
                </Suspense>
                <Suspense fallback={<ChartFallback />}>
                  <BenchmarkPanel symbol={symbol} candles={candles} />
                </Suspense>
              </div>

              <Suspense fallback={<ChartFallback />}>
                <PortfolioPanel
                  symbol={symbol}
                  currentPrice={candles[candles.length - 1].close}
                />
              </Suspense>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WatchlistProvider>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </WatchlistProvider>
  );
}
