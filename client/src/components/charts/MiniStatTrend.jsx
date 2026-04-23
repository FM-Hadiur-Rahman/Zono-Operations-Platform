export default function MiniStatTrend({
  title,
  subtitle,
  value = 0,
  max = 100,
  footer,
}) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min((value / safeMax) * 100, 100);

  return (
    <div className="rounded-[28px] border border-[#eadccf] bg-[linear-gradient(180deg,#fffaf5_0%,#f7eee6_100%)] p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
        {title}
      </p>

      <p className="mt-2 text-sm leading-7 text-[#6b5b52]">{subtitle}</p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-[#1f140f]">{value}</p>
        {footer ? <p className="text-sm text-[#8b7768]">{footer}</p> : null}
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#2d1c13_0%,#8b5e3c_100%)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
