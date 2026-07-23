import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { rsi, macd } from "../utils/indicators";

export function RsiPanel({ candles }) {
  const data = useMemo(() => {
    const rsiVals = rsi(candles, 14);
    return candles.map((c, i) => ({
      date: new Date(c.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      rsi: rsiVals[i],
    }));
  }, [candles]);

  const latestRsi = [...data].reverse().find((d) => d.rsi !== null)?.rsi;

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono font-bold text-sm text-ink">RSI (14)</h2>
        {latestRsi !== undefined && (
          <span
            className={`font-mono text-sm font-semibold tabular ${
              latestRsi > 70 ? "text-red" : latestRsi < 30 ? "text-green" : "text-subtle"
            }`}
          >
            {latestRsi.toFixed(1)}
            {latestRsi > 70 ? " (Overbought)" : latestRsi < 30 ? " (Oversold)" : ""}
          </span>
        )}
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2622" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7C8B82" }} minTickGap={50} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#7C8B82" }}
              width={30}
            />
            <ReferenceLine y={70} stroke="#FF5C5C" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#00D68F" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                background: "#101512",
                border: "1px solid #1E2622",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [v != null ? v.toFixed(1) : "—", "RSI"]}
            />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#00D68F"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MacdPanel({ candles }) {
  const data = useMemo(() => {
    const { macdLine, signalLine, histogram } = macd(candles);
    return candles.map((c, i) => ({
      date: new Date(c.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      macd: macdLine[i],
      signal: signalLine[i],
      histogram: histogram[i],
    }));
  }, [candles]);

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <h2 className="font-mono font-bold text-sm text-ink mb-3">MACD (12, 26, 9)</h2>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2622" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7C8B82" }} minTickGap={50} />
            <YAxis tick={{ fontSize: 10, fill: "#7C8B82" }} width={40} />
            <ReferenceLine y={0} stroke="#1E2622" />
            <Tooltip
              contentStyle={{
                background: "#101512",
                border: "1px solid #1E2622",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, name) => [v != null ? v.toFixed(2) : "—", name]}
            />
            <Bar dataKey="histogram" name="Histogram">
              {data.map((d, i) => (
                <Cell key={i} fill={d.histogram >= 0 ? "#00D68F" : "#FF5C5C"} />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="macd"
              stroke="#00D68F"
              strokeWidth={1.5}
              dot={false}
              name="MACD"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#FFB020"
              strokeWidth={1.5}
              dot={false}
              name="Signal"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
