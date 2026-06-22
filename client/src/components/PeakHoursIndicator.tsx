import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface HourData {
  hour: number;
  displayHour: string;
  count: number;
  normalizedPct: number;
  label: "Peak" | "Moderate" | "Low";
  severity: "high" | "medium" | "low";
}

interface TimeWindow {
  startHour: number;
  endHour: number;
  startDisplay: string;
  endDisplay: string;
  durationHours: number;
}

interface Summary {
  peakHoursCount: number;
  moderateHoursCount: number;
  lowHoursCount: number;
  busiestHour: HourData;
  quietestHour: HourData;
}

interface PeakHoursData {
  hours: HourData[];
  peakWindows: TimeWindow[];
  lowWindows: TimeWindow[];
  bestTimes: TimeWindow[];
  summary: Summary;
}

interface PeakHoursIndicatorProps {
  parkingId: string;
  parkingName: string;
  onClose: () => void;
}

const PeakHoursIndicator: React.FC<PeakHoursIndicatorProps> = ({
  parkingId,
  parkingName,
  onClose,
}) => {
  const [data, setData] = useState<PeakHoursData | null>(null);
  const [meta, setMeta] = useState<{ totalDataPoints: number; message?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");
  const [highlightHour, setHighlightHour] = useState<number | null>(null);

  const { theme } = useTheme();

  const tc = {
    cardBg: theme === "light" ? "bg-white" : "bg-[#1a1a1a]",
    cardBorder: theme === "light" ? "border-gray-200" : "border-[#1B42CB]/20",
    text: theme === "light" ? "text-gray-900" : "text-[#EEECF6]",
    textSecondary: theme === "light" ? "text-gray-600" : "text-[#EEECF6]/70",
    textMuted: theme === "light" ? "text-gray-400" : "text-[#EEECF6]/40",
    rowBg: theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5",
    divider: theme === "light" ? "border-gray-200" : "border-white/10",
  };

  useEffect(() => {
    const fetchPeakHours = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/parking/${parkingId}/peak-hours`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setMeta(json.meta);
        } else {
          setError(json.message || "Failed to load peak hours data");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPeakHours();
  }, [parkingId]);

  const getSeverityBarColor = (severity: string) => {
    if (severity === "high") return "bg-red-500";
    if (severity === "medium") return "bg-yellow-400";
    return "bg-green-500";
  };

  const getSeverityBadgeColor = (severity: string) => {
    if (severity === "high")
      return theme === "light"
        ? "bg-red-100 text-red-700"
        : "bg-red-500/20 text-red-300";
    if (severity === "medium")
      return theme === "light"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-yellow-500/20 text-yellow-300";
    return theme === "light"
      ? "bg-green-100 text-green-700"
      : "bg-green-500/20 text-green-300";
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "high")
      return <Icons.TrendingUp className="w-3 h-3 text-red-500" />;
    if (severity === "medium")
      return <Icons.Minus className="w-3 h-3 text-yellow-400" />;
    return <Icons.TrendingDown className="w-3 h-3 text-green-500" />;
  };

  // Only show every 3rd hour label on the chart to avoid crowding
  const shouldShowLabel = (hour: number) => hour % 3 === 0;
  const highlightedHourData = data?.hours.find((h) => h.hour === highlightHour) ?? null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${tc.cardBg} ${tc.cardBorder}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1B42CB]/20 bg-gradient-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                <Icons.BarChart2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${tc.text}`}>Peak Hours</h2>
                <p className={`text-sm ${tc.textSecondary}`}>{parkingName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex rounded-lg overflow-hidden border ${tc.cardBorder}`}
              >
                {(["chart", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                      viewMode === mode
                        ? "bg-[#1B42CB] text-white"
                        : `${tc.textSecondary} ${tc.rowBg}`
                    }`}
                  >
                    {mode === "chart" ? (
                      <Icons.BarChart2 className="w-4 h-4" />
                    ) : (
                      <Icons.List className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${tc.text}`}
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-[#1B42CB]/30 border-t-[#1B42CB] rounded-full animate-spin" />
              <p className={`text-sm ${tc.textSecondary}`}>
                Analyzing occupancy trends…
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Icons.AlertTriangle className="w-10 h-10 text-[#FF2F6C]" />
              <p className={`text-sm ${tc.textSecondary}`}>{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Low data notice */}
              {meta && meta.totalDataPoints < 5 && (
                <div
                  className={`flex items-start gap-3 mb-5 p-3 rounded-xl border ${
                    theme === "light"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                  }`}
                >
                  <Icons.Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    {meta.message ||
                      "Limited data available. Distribution is estimated and will improve over time."}
                  </p>
                </div>
              )}

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div
                  className={`rounded-xl p-3 border ${
                    theme === "light"
                      ? "bg-red-50 border-red-200"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Peak hours</p>
                  <p className="text-xl font-bold text-red-500">
                    {data.summary.peakHoursCount}h
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 border ${
                    theme === "light"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-yellow-500/10 border-yellow-500/20"
                  }`}
                >
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Moderate</p>
                  <p className="text-xl font-bold text-yellow-500">
                    {data.summary.moderateHoursCount}h
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 border ${
                    theme === "light"
                      ? "bg-green-50 border-green-200"
                      : "bg-green-500/10 border-green-500/20"
                  }`}
                >
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Low traffic</p>
                  <p className="text-xl font-bold text-green-500">
                    {data.summary.lowHoursCount}h
                  </p>
                </div>
              </div>

              {/* Best time to visit */}
              {data.bestTimes.length > 0 && (
                <div
                  className={`rounded-xl border p-4 mb-6 ${
                    theme === "light"
                      ? "bg-green-50 border-green-200"
                      : "bg-green-500/10 border-green-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Clock className="w-4 h-4 text-green-500" />
                    <span className={`text-sm font-semibold ${tc.text}`}>
                      Best times to visit
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.bestTimes.map((w, i) => (
                      <span
                        key={i}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          theme === "light"
                            ? "bg-green-100 text-green-700"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {w.startDisplay} – {w.endDisplay}
                      </span>
                    ))}
                  </div>
                </div>
              )}

      {/* Chart view */}
      {viewMode === "chart" && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${tc.textMuted} mb-4`}>
                    24-hour traffic distribution
                  </p>

                  {/* Bar chart */}
                  <div className="relative">
                    <div className="flex items-end gap-1 h-32">
                      {data.hours.map((h) => (
                        <div
                          key={h.hour}
                          className="flex-1 flex flex-col items-center justify-end gap-0.5 cursor-pointer group relative"
                          onMouseEnter={() => setHighlightHour(h.hour)}
                          onMouseLeave={() => setHighlightHour(null)}
                        >
                          {/* --- NEW FLOATING TOOLTIP --- */}
                          {highlightHour === h.hour && (
                            <div
                              className={`absolute bottom-full mb-2 w-max z-50 p-2.5 rounded-xl shadow-xl border flex items-center gap-3 ${tc.cardBorder} ${theme === "light" ? "bg-white" : "bg-[#1a1a1a]"}`}
                              style={{
                                left: h.hour < 8 ? "0" : h.hour > 15 ? "auto" : "50%",
                                right: h.hour > 15 ? "0" : "auto",
                                transform: h.hour >= 8 && h.hour <= 15 ? "translateX(-50%)" : "none"
                              }}
                            >
                              <span className={`text-sm font-bold ${tc.text}`}>{h.displayHour}</span>
                              <div className="flex items-center gap-1.5">
                                {getSeverityIcon(h.severity)}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getSeverityBadgeColor(h.severity)}`}>
                                  {h.label}
                                </span>
                                <span className={`text-xs font-medium ${tc.textSecondary}`}>{h.normalizedPct}%</span>
                              </div>
                            </div>
                          )}

                          {/* The Bar */}
                          <div
                            className={`w-full rounded-t-sm transition-all duration-200 ${getSeverityBarColor(h.severity)} ${highlightHour === h.hour ? "opacity-100 scale-x-110" : "opacity-70 group-hover:opacity-90"}`}
                            style={{ height: `${Math.max(4, h.normalizedPct)}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Hour labels */}
                    <div className="flex gap-1 mt-1">
                      {data.hours.map((h) => (
                        <div key={h.hour} className="flex-1 flex justify-center">
                          {shouldShowLabel(h.hour) && (
                            <span className={`text-[9px] ${tc.textMuted} whitespace-nowrap`}>
                              {h.displayHour}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* List view */}
              {viewMode === "list" && (
                <div className="space-y-1">
                  {data.hours.map((h) => (
                    <div
                      key={h.hour}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${tc.rowBg}`}
                    >
                      <span
                        className={`text-sm font-medium w-14 shrink-0 ${tc.textSecondary}`}
                      >
                        {h.displayHour}
                      </span>
                      <div
                        className={`flex-1 h-4 rounded-full overflow-hidden ${
                          theme === "light" ? "bg-gray-100" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${getSeverityBarColor(h.severity)}`}
                          style={{ width: `${h.normalizedPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full w-20 text-center shrink-0 ${getSeverityBadgeColor(h.severity)}`}
                      >
                        {h.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div
                className={`mt-6 pt-4 border-t ${tc.divider} flex flex-wrap gap-4`}
              >
                {[
                  { color: "bg-red-500", label: "Peak (≥70%)" },
                  { color: "bg-yellow-400", label: "Moderate (35–69%)" },
                  { color: "bg-green-500", label: "Low (<35%)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className={`text-xs ${tc.textSecondary}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeakHoursIndicator;