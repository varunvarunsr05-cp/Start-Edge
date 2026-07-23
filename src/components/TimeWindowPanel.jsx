import { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { weekdayVolatility } from "../utils/strategyEngine";

export default function TimeWindowPanel({ candles }) {
  const data = useMemo(() => weekdayVolatility(candles), [candles]);

  const bestDay = data.length
    ? [...data].sort((a, b) => b.avgReturn - a.avgReturn)[0]
    : null;
  const mostVolatileDay = data.length
    ? [...data].sort((a, b) => b.avgMovement - a.avgMovement)[0]
    : null;

  return (
    <div className="bg-panel border border-line rounded-lg p-5 shadow-panel">
      <h2 className="font-mono font-bold text-sm text-ink mb-1">
        Historical Time-Window Patterns
      </h2>
      <p className="text-xs text-subtle mb-4">
        Average daily return by weekday, based on this stock's price history.
        Descriptive only — not a forecast.
      </p>

      <div className="h-48 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2622" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7C8B82" }} />
            <YAxis
              tick={{ fontSize: 10, fill: "#7C8B82" }}
              width={40}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#101512",
                border: "1px solid #1E2622",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, name) => [`${v.toFixed(2)}%`, name]}
            />
            <Bar dataKey="avgReturn" name="Avg return">
              {data.map((d, i) => (
                <Cell key={i} fill={d.avgReturn >= 0 ? "#00D68F" : "#FF5C5C"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {bestDay && mostVolatileDay && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-bg border border-line rounded-md p-3">
            <p className="text-subtle mb-1">Best avg. weekday historically</p>
            <p className="font-mono font-bold text-green">
              {bestDay.day} (+{bestDay.avgReturn.toFixed(2)}%)
            </p>
          </div>
          <div className="bg-bg border border-line rounded-md p-3">
            <p className="text-subtle mb-1">Most volatile weekday</p>
            <p className="font-mono font-bold text-amber">
              {mostVolatileDay.day} (±{mostVolatileDay.avgMovement.toFixed(2)}%)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
