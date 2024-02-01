import * as d3 from "d3"
import { useRef, useEffect, useState } from "react"

type BarPlotProps = {
  data: { x: string; y: number }[]
  containerWidth?: number | string
  containerHeight?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
}

export default function BarPlot({
  data,
  containerWidth = "100%",
  containerHeight = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 100,
}: BarPlotProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [animate, setAnimate] = useState(true)
  const [width, setWidth] = useState<number | undefined>(0)
  const [height, setHeight] = useState<number | undefined>(0)

  const drawGraph = () => {
    if (width && height) {
      const x = d3
        .scaleBand()
        .domain(data.map((datum) => datum.x))
        .range([marginLeft, width - marginRight])
        .padding(0.1)

      const yMin = 0
      const yMax = d3.max(data, (d) => d.y)

      const y = d3
        .scaleLinear()
        .domain([yMin, yMax!])
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

        // Add the x-axis and label.
        svg
          .append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(d3.axisBottom(x).tickSizeOuter(0))

        svg
          .append("g")
          .attr("transform", `translate(${marginLeft}, 0)`)
          .call(d3.axisLeft(y))
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g
              .append("text")
              .attr("x", -marginLeft)
              .attr("y", 10)
              .attr("fill", "currentColor")
              .attr("text-anchor", "start"),
          )

        // Add a rect for each bar.
        svg
          .append("g")
          .attr("fill", "steelblue")
          .selectAll()
          .data(data)
          .join("rect")
          .attr("x", (d) => x(d.x)!)
          .attr("y", (d) => y(d.y))
          .attr("height", (d) => y(0) - y(d.y))
          .attr("width", x.bandwidth())

        if (animate) {
        } else {
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
