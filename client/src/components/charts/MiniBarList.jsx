export default function MiniBarList({
  title,
  subtitle,
  items = [],
  valueKey = "value",
  labelKey = "label",
  formatter = (value) => value,
}) {
  const maxValue = Math.max(...items.map((item) => item[valueKey] || 0), 1);

  return (
    <div className="rounded-[28px] border border-[#eadccf] bg-white/90 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
        {title}
      </p>

      {subtitle ? (
        <p className="mt-2 text-sm leading-7 text-[#6b5b52]">{subtitle}</p>
      ) : null}

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4 text-sm text-[#6b5b52]">
            No data available yet.
          </div>
        ) : (
          items.map((item, index) => {
            const value = item[valueKey] || 0;
            const width = `${Math.max(
              (value / maxValue) * 100,
              value > 0 ? 8 : 0,
            )}%`;

            return (
              <div
                key={item.id || item[labelKey] || index}
                className="rounded-2xl border border-[#f0e3d7] bg-[#fffdfa] p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#2d1c13]">
                      {item[labelKey]}
                    </p>
                    {item.subtext ? (
                      <p className="mt-1 text-sm text-[#8b7768]">
                        {item.subtext}
                      </p>
                    ) : null}
                  </div>

                  <span className="text-sm font-semibold text-[#1f140f]">
                    {formatter(value, item)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#f3e8dc]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#8b5e3c_0%,#c8a27c_100%)] transition-all duration-500"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
