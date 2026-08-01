"use client"

interface BubbleGridProps {
  pct: number
  cols?: number
  rows?: number
  size?: number
  gap?: number
  fill?: string
}

export function BubbleGrid({
  pct,
  cols = 10,
  rows = 3,
  size = 7,
  gap = 3,
  fill = "var(--primary)",
}: BubbleGridProps) {
  const total = cols * rows
  const filled = Math.round((pct / 100) * total)
  const cells = Array.from({ length: total })
  const w = cols * (size + gap) - gap
  const h = rows * (size + gap) - gap

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {cells.map((_, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const cx = col * (size + gap) + size / 2
        const cy = row * (size + gap) + size / 2
        const isFilled = i < filled
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={size / 2}
            fill={isFilled ? fill : "none"}
            stroke={isFilled ? fill : "var(--outline-variant)"}
            strokeWidth="1.1"
            className="transition-colors duration-200"
          />
        )
      })}
    </svg>
  )
}
