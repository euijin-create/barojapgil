interface MapLegendProps {
  showTraffic: boolean;
  showHotspots: boolean;
  showIncidents: boolean;
  showReportAreas: boolean;
}

export function MapLegend({
  showTraffic,
  showHotspots,
  showIncidents,
  showReportAreas,
}: MapLegendProps) {
  return (
    <aside
      className="rounded-xl border border-[#dde6ee] bg-white px-3 py-2.5"
      aria-label="지도 범례"
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs font-bold text-[#526f88]">
        {showTraffic ? (
          <li className="flex min-w-0 items-center gap-2">
            <span className="flex w-5 shrink-0 items-center gap-0.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2fa36b]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#efb33f]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#dc5c52]" />
            </span>
            <span className="truncate">Kakao 교통</span>
          </li>
        ) : null}
        {showHotspots ? (
          <li className="flex min-w-0 items-center gap-2">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#c56b18] bg-[#f39a1e]/20"
              aria-hidden="true"
            />
            <span className="truncate">TAAS 사고다발</span>
          </li>
        ) : null}
        {showIncidents ? (
          <li className="flex min-w-0 items-center gap-2">
            <span
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#45657f] text-[10px] font-black leading-none text-white"
              aria-hidden="true"
            >
              !
            </span>
            <span className="truncate">TOPIS 돌발</span>
          </li>
        ) : null}
        {showReportAreas ? (
          <li className="flex min-w-0 items-center gap-2">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#168f73] bg-[#26b894]/20"
              aria-hidden="true"
            />
            <span className="truncate">신고 DEMO</span>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
