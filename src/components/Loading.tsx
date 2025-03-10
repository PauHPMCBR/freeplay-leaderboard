import React from "react"

export default function Loading() {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }