"use client"

import LinePlot from "@/components/line-plot"
import animals from "../assets/data/animal-welfare.json"
import BarPlot from "@/components/bar-plot"

export default function Home() {
  const data = animals
    .filter((e) => e.location == "World")
    .map((e) => {
      return { x: e.year, y: e.animals }
    })

  return (
    <main className="m-auto max-w-[800px] p-3">
      <h1 className="mb-3 mt-6 text-center">D3 graphs</h1>
      <h2>Line plot</h2>
      <LinePlot data={data} />
      <h2>Bar plot</h2>
      <BarPlot
        data={[
          { x: "A", y: 1 },
          { x: "B", y: 2 },
          { x: "C", y: 3 },
        ]}
      />
    </main>
  )
}
