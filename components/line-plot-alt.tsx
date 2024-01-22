import * as d3 from "d3"
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
  marginLeft = 100,
}: LinePlotProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [animate, setAnimate] = useState(true)
  const [width, setWidth] = useState<number | undefined>(0)
  const [height, setHeight] = useState<number | undefined>(0)

  const drawGraph = () => {
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
        const lineGenerator = d3
          .line<{ x: number; y: number }>()
          .x((d) => x(d.x))
          .y((d) => y(d.y))

        const line = svg
          .selectAll(".line")
          .data([data])
          .join("path")
          .attr("d", (d) => lineGenerator(d))
          .attr("fill", "none")

        // Add circles
        const circles = svg
          .append("g")
          .selectAll("dot")
          .data(data)
          .join("circle")
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))

        if (animate) {
          const lineNode = line.node()

          if (lineNode instanceof SVGPathElement) {
            const pathLength = lineNode.getTotalLength()
            console.log(pathLength)

            circles
              .attr("r", 0)
              .transition()
              .duration(250)
              .delay((d, i) => i * 20)
              .attr("r", 2)
              .on("end", () => {
                line
                  .attr("stroke", "black")
                  .attr("stroke-dasharray", pathLength + " " + pathLength)
                  .attr("stroke-dashoffset", pathLength)
                  .transition()
                  .duration(1500)
                  .attr("stroke-dashoffset", 0)
              })

            setAnimate(false)
          }
        } else {
          circles.attr("r", 2)
          line.attr("stroke", "black")
        }

        // Add tooltip
        const tooltip = d3
          .select("#tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background-color", "red")
          .html("I'm a tooltip written in HTML")

        svg
          .selectAll("circle")
          .on("mouseover", function () {
            return tooltip
              .style("top", d3.select(this).attr("cy") + "px")
              .style("left", d3.select(this).attr("cx") + "px")
              .style("visibility", "visible")
          })
          .on("mousemove", function () {
            console.log(d3.select(this).attr("cy"))
            return tooltip
              .style("top", d3.select(this).attr("cy") + "px")
              .style("left", d3.select(this).attr("cx") + "px")
          })
          .on("mouseout", function () {
            return tooltip
              .style("top", d3.select(this).attr("cy") + "px")
              .style("left", d3.select(this).attr("cx") + "px")
              .style("visibility", "hidden")
          })
      }
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

  useEffect(() => {
    drawGraph()
  }, [width, height])

  return (
    <div
      ref={parentRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      <svg ref={svgRef}></svg>
      <div id="tooltip"></div>
    </div>
  )
}
