import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SpendTrendChart({ data = [], title, subtitle }) {
  return (
    <div className="rounded-[28px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
        {title || "Spend Trend"}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-[#1f140f]">
        Monthly spend overview
      </h3>

      {subtitle ? (
        <p className="mt-3 text-sm leading-7 text-[#6b5b52]">{subtitle}</p>
      ) : null}

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eadccf" />
            <XAxis dataKey="label" stroke="#8b7768" fontSize={12} />
            <YAxis
              stroke="#8b7768"
              fontSize={12}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value) => [
                `€${Number(value || 0).toFixed(2)}`,
                "Spend",
              ]}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #eadccf",
                background: "#fffdfa",
                boxShadow: "0 10px 30px rgba(49,31,18,0.08)",
              }}
            />
            <Bar dataKey="spend" radius={[10, 10, 0, 0]} fill="#7a5a43" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
