import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { sma, bollingerBands } from "../utils/indicators";

const OVERLAY_OPTIONS = [
  { id: "sma20", label: "SMA 20" },
  { id: "sma50", label: "SMA 50" },
  { id: "bollinger", label: "Bollinger Bands" },
];

export default function PriceChart({ candles }) {
  const [activeOverlays, setActiveOverlays] = useState(["sma20", "sma50"]);

  const chartData = useMemo(() => {
    const sma20 = sma(candles, 20);
    const sma50 = sma(candles, 50);
    const bb = bollingerBands(candles, 20);

    return candles.map((c, i) => ({
      date: new Date(c.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      close: c.close,
      sma20: sma20[i],
      sma50: sma50[i],
      bbUpper: bb.upper[i],
      bbLower: bb.lower[i],
    }));
  }, [candles]);

  const toggleOverlay = (id) => {
    setActiveOverlays((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-mono font-bold text-sm text-ink">Price Chart</h2>
        <div className="flex gap-1.5 flex-wrap">
          {OVERLAY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggleOverlay(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                activeOverlays.includes(opt.id)
                  ? "bg-green/10 border-green text-green"
                  : "border-line text-subtle hover:border-green hover:text-green"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2622" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#7C8B82" }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#7C8B82" }}
              domain={["auto", "auto"]}
              width={55}
              tickFormatter={(v) => `₹${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "#101512",
                border: "1px solid #1E2622",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#E4EFE8" }}
              formatter={(value, name) => [
                value != null ? `₹${value.toFixed(2)}` : "—",
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            {activeOverlays.includes("bollinger") && (
              <>
                <Area
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="none"
                  fill="#00D68F"
                  fillOpacity={0.04}
                  name="Bollinger Upper"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="bbLower"
                  stroke="#7C8B82"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Bollinger Lower"
                  isAnimationActive={false}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="close"
              stroke="#00D68F"
              strokeWidth={2}
              dot={false}
              name="Close"
              isAnimationActive={false}
            />

            {activeOverlays.includes("sma20") && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#FFB020"
                strokeWidth={1.5}
                dot={false}
                name="SMA 20"
                isAnimationActive={false}
              />
            )}

            {activeOverlays.includes("sma50") && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#FF5C5C"
                strokeWidth={1.5}
                dot={false}
                name="SMA 50"
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
