"use client"

import { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

export interface RenderMathProps {
  text?: string | null
  isMath?: boolean
  className?: string
  as?: React.ElementType
}

export function RenderMath({
  text,
  isMath,
  className = "",
  as: Component = "span",
}: RenderMathProps) {
  if (!text) return null

  // If isMath is not explicitly false, auto-detect LaTeX math delimiters ($, $$, \(, \[)
  const hasMathDelimiters =
    /\$[^$\n]+\$/.test(text) ||
    /\$\$[\s\S]*?\$\$/.test(text) ||
    /\\\([\s\S]*?\\\)/.test(text) ||
    /\\\[[\s\S]*?\\\]/.test(text)
  const shouldRenderMath = isMath !== undefined ? (isMath || hasMathDelimiters) : hasMathDelimiters

  if (!shouldRenderMath) {
    return <Component className={className}>{text}</Component>
  }

  const htmlContent = useMemo(() => {
    try {
      // 1. Replace \[...\] and $$...$$ (display mode math)
      let result = text
        .replace(
          /\\\[([\s\S]*?)\\\]/g,
          (_: string, expr: string) => {
            try {
              return katex.renderToString(expr.trim(), {
                displayMode: true,
                throwOnError: false,
              })
            } catch {
              return `\\[${expr}\\]`
            }
          }
        )
        .replace(
          /\$\$([\s\S]*?)\$\$/g,
          (_: string, expr: string) => {
            try {
              return katex.renderToString(expr.trim(), {
                displayMode: true,
                throwOnError: false,
              })
            } catch {
              return `$$${expr}$$`
            }
          }
        )

      // 2. Replace \(...\) and $...$ (inline math)
      result = result
        .replace(
          /\\\(([\s\S]*?)\\\)/g,
          (_: string, expr: string) => {
            try {
              return katex.renderToString(expr.trim(), {
                displayMode: false,
                throwOnError: false,
              })
            } catch {
              return `\\(${expr}\\)`
            }
          }
        )
        .replace(
          /\$([^$\n]+?)\$/g,
          (_: string, expr: string) => {
            try {
              return katex.renderToString(expr.trim(), {
                displayMode: false,
                throwOnError: false,
              })
            } catch {
              return `$${expr}$`
            }
          }
        )

      return result
    } catch {
      return text
    }
  }, [text])

  return (
    <Component
      className={`katex-container ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
