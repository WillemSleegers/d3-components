"use client"

import LinePlot from "@/components/line-plot"

export default function Home() {
  const data = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
  ]

  return (
    <main className="m-auto max-w-[800px]">
      <h1 className="mb-3 mt-6 text-center">D3 graphs</h1>
      <h2>Line plot</h2>
      <LinePlot data={data} />
    </main>
  )
}
