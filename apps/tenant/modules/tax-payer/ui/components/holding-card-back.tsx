"use client"

import React from "react"

interface CardBackProps {
  forExport?: boolean
}

export const CardBack: React.FC<CardBackProps> = ({ forExport = false }) => (
  <div
    className={`overflow-hidden ${forExport ? "" : "rounded-sm"}`}
    style={{
      width: "3.3in",
      height: "2.05in",
      border: "1px solid #ccc",
    }}
  >
    <img
      src="/card-back.jpg"
      alt="Card Back"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "fill",
        display: "block",
      }}
    />
  </div>
)
