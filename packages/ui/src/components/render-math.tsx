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

  // Normalize escaped newlines "\\n" and "\\r\\n" -> "\n"
  const normalizedText = typeof text === "string"
    ? text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n")
    : text

  // If isMath is not explicitly false, auto-detect LaTeX math delimiters ($, $$, \(, \[)
  const hasMathDelimiters =
    /\$[^$\n]+\$/.test(normalizedText) ||
    /\$\$[\s\S]*?\$\$/.test(normalizedText) ||
    /\\\([\s\S]*?\\\)/.test(normalizedText) ||
    /\\\[[\s\S]*?\\\]/.test(normalizedText)
  const shouldRenderMath = isMath !== undefined ? (isMath || hasMathDelimiters) : hasMathDelimiters

  if (!shouldRenderMath) {
    return <Component className={`whitespace-pre-wrap ${className}`}>{normalizedText}</Component>
  }

  const htmlContent = useMemo(() => {
    try {
      // 1. Replace \[...\] and $$...$$ (display mode math)
      let result = normalizedText
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

      // 3. Convert newlines to <br /> tags for HTML rendering
      result = result.replace(/\n/g, "<br />")

      return result
    } catch {
      return normalizedText
    }
  }, [normalizedText])

  return (
    <Component
      className={`katex-container whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
