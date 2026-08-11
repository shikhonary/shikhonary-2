"use client"

import { BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface WardCollectionChartProps {
  wardBreakdown: any[]
  formatTaka: (amount: number) => string
  formatFullTaka: (amount: number) => string
}

export function WardCollectionChart({
  wardBreakdown,
  formatTaka,
  formatFullTaka,
}: WardCollectionChartProps) {
  const ASSESSED_COLOR = "hsl(217, 91%, 60%)"
  const COLLECTED_COLOR = "hsl(142, 71%, 45%)"

  function ChartTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: { value: number; name: string; color: string }[]
    label?: string
  }) {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border/60 rounded-xl shadow-lg p-3 text-xs space-y-1.5 text-foreground">
        <p className="font-display font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-muted-foreground font-body">{entry.name}:</span>
            <span className="font-bold text-foreground">{formatFullTaka(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden font-body">
      <div className="px-5 pt-5 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-foreground">ওয়ার্ড-ভিত্তিক কর আদায়</h3>
            <p className="text-[10px] text-muted-foreground">ধার্যকৃত ও আদায়কৃত করের তুলনামূলক চিত্র</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        {wardBreakdown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">কোনো ওয়ার্ড ডেটা পাওয়া যায়নি</p>
            <p className="text-xs text-center max-w-xs">
              প্রথমে করদাতা যোগ করুন, তারপর ওয়ার্ড-ভিত্তিক চিত্র এখানে দেখা যাবে।
            </p>
          </div>
        ) : (
          <>
            <div style={{ height: Math.max(200, wardBreakdown.length * 56) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wardBreakdown}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                  barGap={4}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                    tickFormatter={(v) => formatTaka(v as number)}
                    axisLine={false}
                    tickLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    type="category"
                    dataKey="wardName"
                    width={80}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.6, radius: 4 }}
                  />
                  <Bar dataKey="assessedAmount" name="ধার্যকৃত" radius={[0, 4, 4, 0]} maxBarSize={12}>
                    {wardBreakdown.map((_item, i) => (
                      <Cell key={i} fill={ASSESSED_COLOR} fillOpacity={0.3} />
                    ))}
                  </Bar>
                  <Bar dataKey="collectedAmount" name="আদায়" radius={[0, 4, 4, 0]} maxBarSize={12}>
                    {wardBreakdown.map((_item, i) => (
                      <Cell key={i} fill={COLLECTED_COLOR} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 pt-2 border-t border-border/40 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: ASSESSED_COLOR, opacity: 0.3 }} />
                <span className="text-xs text-muted-foreground">ধার্যকৃত</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: COLLECTED_COLOR }} />
                <span className="text-xs text-muted-foreground">আদায়</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
