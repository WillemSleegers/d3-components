"use client"

import LinePlotAlt from "@/components/line-plot-alt"
import animals from "../assets/data/animal-welfare.json"

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
      <LinePlotAlt data={data} />
    </main>
  )
}
