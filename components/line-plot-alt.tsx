import * as d3 from "d3"
import { create } from "domain"
import { useRef, useEffect, useState, useLayoutEffect } from "react"

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

  const [animate, setAnimate] = useState(true)
  const [width, setWidth] = useState<number | undefined>(0)
  const [height, setHeight] = useState<number | undefined>(0)

  const createGraph = () => {
    const valuesX = data.map((datum) => datum.x)
    const domainX = d3.extent(valuesX) as number[]

    const valuesY = data.map((datum) => datum.y)
    const domainY = d3.extent(valuesY) as number[]

    if (width && height) {
      const x = d3
        .scaleLinear()
        .domain(domainX)
        .range([marginLeft, width - marginRight])

      const y = d3
        .scaleLinear()
        .domain(domainY)
        .range([height - marginBottom, marginTop])

      d3.select(svgRef.current).selectAll("*").remove()

      if (svgRef.current) {
        const svg = d3
          .select(svgRef.current)
          .attr("width", width)
          .attr("height", height)

        // Set axes
        const xAxis = d3.axisBottom(x)
        const yAxis = d3.axisLeft(y)

        svg
          .append("g")
          .call(xAxis)
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height - marginBottom})`)

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
          .attr("class", "line1")

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
  }

  const animateGraph = () => {
    const points = d3.selectAll("circle")
    const line = d3.select<SVGGeometryElement, "path">(".line1")
    const lineNode = line.node()

    console.log(lineNode && points)

    if (lineNode && points) {
      const pathLength = lineNode.getTotalLength()

      points.attr("r", 0)

      line
        .attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1500)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          points.transition().duration(1500).attr("r", 5)
        })

      setAnimate(false)
    }
  }

  const getContainerSize = () => {
    if (parentRef.current) {
      setWidth(parentRef.current.offsetWidth)
      setHeight(parentRef.current.offsetHeight)
    }
  }

  useEffect(() => {
    getContainerSize()

    const handleResize = () => {
      getContainerSize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useLayoutEffect(() => {
    createGraph()

    if (animate) animateGraph()
  }, [width, height])

  return (
    <div
      ref={parentRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      <svg ref={svgRef}></svg>
    </div>
  )
}
