import * as d3 from "d3"
import { create } from "domain"
import { useRef, useEffect, useState } from "react"

type LinePlotProps = {
  data: { x: number; y: number }[]
  containerWidth?: number | string
  containerHeight?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
}

export default function LinePlotAlt({
  data,
  containerWidth = "100%",
  containerHeight = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
}: LinePlotProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const createGraph = () => {
    const valuesX = data.map((datum) => datum.x)
    const domainX = d3.extent(valuesX) as number[]

    const valuesY = data.map((datum) => datum.y)
    const domainY = d3.extent(valuesY) as number[]

    const x = d3
      .scaleLinear()
      .domain(domainX)
      .range([marginLeft, dimensions.width - marginRight])

    const y = d3
      .scaleLinear()
      .domain(domainY)
      .range([dimensions.height - marginBottom, marginTop])

    if (svgRef.current) {
      const svg = d3
        .select(svgRef.current)
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

      // Set axes
      const xAxis = d3.axisBottom(x)
      const yAxis = d3.axisLeft(y)

      svg
        .append("g")
        .call(xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${dimensions.height - marginBottom})`)

      svg
        .append("g")
        .call(yAxis)
        .attr("class", "y-axis")
        .attr("transform", `translate(${marginLeft}, 0)`)

      // Add line
      const line = d3
        .line<{ x: number; y: number }>()
        .x((d) => x(d.x))
        .y((d) => y(d.y))

      svg
        .selectAll(".line")
        .data([data])
        .join("path")
        .attr("d", (d) => line(d))
        .attr("fill", "none")
        .attr("stroke", "black")

      // Add circles
      svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", (d) => x(d.x))
        .attr("cy", (d) => y(d.y))
        .attr("r", 5)
    }
  }

  const updateGraph = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove()

      createGraph()
    }
  }

  useEffect(() => {
    const getDimensions = () => ({
      width: parentRef.current!.offsetWidth,
      height: parentRef.current!.offsetHeight,
    })

    const handleResize = () => {
      setDimensions(getDimensions())
    }

    if (parentRef.current!) {
      setDimensions(getDimensions())
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [parentRef])

  useEffect(() => {
    updateGraph()
  }, [dimensions])

  useEffect(() => {
    createGraph()
  }, [])

  return (
    <div
      ref={parentRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      <svg ref={svgRef}></svg>
    </div>
  )
}
