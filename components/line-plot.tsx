import * as d3 from "d3"
import { useRef, useEffect, useState, MouseEvent } from "react"

type Datum = {
  x: number
  y: number
}

type LinePlotProps = {
  data: Datum[]
  containerWidth?: number | string
  containerHeight?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  showTooltip?: boolean
  showCrosshairs?: boolean
}

const LinePlot = ({
  data,
  containerWidth = "100%",
  containerHeight = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 100,
  showTooltip = true,
  showCrosshairs = true,
}: LinePlotProps) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [animate, setAnimate] = useState(true)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const drawGraph = () => {
    if (width && height) {
      // Clear the graph
      d3.select(svgRef.current).selectAll("*").remove()

      // Build the graph
      if (svgRef.current) {
        const svg = d3.select(svgRef.current)

        // Set graph size
        svg.attr("width", width).attr("height", height)

        // Set axes
        const valuesX = data.map((d) => d.x)
        const domainX = d3.extent(valuesX) as [number, number]

        const valuesY = data.map((d) => d.y)
        const domainY = d3.extent(valuesY) as [number, number]

        const x = d3
          .scaleLinear()
          .domain(domainX)
          .range([marginLeft, width - marginRight])

        const y = d3
          .scaleLinear()
          .domain(domainY)
          .range([height - marginBottom, marginTop])

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

        // Create the grid
        svg
          .append("g")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.1)
          .call((g) =>
            g
              .append("g")
              .selectAll("line")
              .data(x.ticks())
              .join("line")
              .attr("x1", (d) => x(d))
              .attr("x2", (d) => x(d))
              .attr("y1", marginTop)
              .attr("y2", height - marginBottom),
          )
          .call((g) =>
            g
              .append("g")
              .selectAll("line")
              .data(y.ticks())
              .join("line")
              .attr("y1", (d) => y(d))
              .attr("y2", (d) => y(d))
              .attr("x1", marginLeft)
              .attr("x2", width - marginRight),
          )

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

        // Add tooltip
        if (showTooltip) {
          const tooltipDiv = d3.select("#line-tooltip")
          circles.call(tooltip, tooltipDiv)
        }

        // Add crosshairs
        if (showCrosshairs) {
          svg.on("mousemove.crosshair", (event: MouseEvent) => {
            const [mouseX, mouseY] = d3.pointer(event)

            // Remove lines
            svg.select(".crosshair-x").remove()
            svg.select(".crosshair-y").remove()

            if (
              mouseX > marginLeft &&
              mouseX < width - marginRight &&
              mouseY > marginTop &&
              mouseY < height - marginBottom
            ) {
              svg
                .append("line")
                .style("stroke", "black")
                .attr("stroke-opacity", 0.1)
                .lower() // Make sure the line appears below other elements
                .attr("class", "crosshair-x")
                .attr("y1", 0 + marginTop)
                .attr("y2", height - marginBottom)
                .attr("x1", mouseX)
                .attr("x2", mouseX)

              svg
                .append("line")
                .style("stroke", "black")
                .attr("stroke-opacity", 0.1)
                .lower() // Make sure the line appears below other elements
                .attr("class", "crosshair-y")
                .attr("y1", mouseY)
                .attr("y2", mouseY)
                .attr("x1", 0 + marginLeft)
                .attr("x2", width - marginRight)
            }
          })
        }

        if (animate) {
          const lineNode = line.node()

          if (lineNode instanceof SVGPathElement) {
            const pathLength = lineNode.getTotalLength()

            line
              .attr("stroke", "black")
              .attr("stroke-dasharray", pathLength + " " + pathLength)
              .attr("stroke-dashoffset", pathLength)
              .transition()
              .ease(d3.easeCubicOut)
              .duration(1000)
              .attr("stroke-dashoffset", 0)
              .on("end", () => {
                circles
                  .attr("r", 0)
                  .transition()
                  .ease(d3.easeCubicInOut)
                  .duration(500)
                  .attr("r", 2)
              })

            // circles
            //   .attr("r", 0)
            //   .transition()
            //   .duration(1000)
            //   .delay((_d, i) => i ^ 2)
            //   .attr("r", 2)
            //   .on("end", () => {
            //     line
            //       .attr("stroke", "black")
            //       .attr("stroke-dasharray", pathLength + " " + pathLength)
            //       .attr("stroke-dashoffset", pathLength)
            //       .transition()
            //       .duration(1000)
            //       .attr("stroke-dashoffset", 0)
            //   })

            setAnimate(false)
          }
        } else {
          circles.attr("r", 2)
          line.attr("stroke", "black")
        }
      }
    }
  }

  const tooltip = (
    selectionGroup: d3.Selection<
      d3.BaseType | SVGCircleElement,
      Datum,
      SVGGElement,
      unknown
    >,
    tooltipDiv: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>,
  ) => {
    const showTooltip = () => {
      tooltipDiv.style("display", "block")
    }

    const setContents = (
      d: Datum,
      tooltipDiv: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>,
    ) => {
      tooltipDiv
        .selectAll("p")
        .data(Object.entries(d))
        .join("p")
        .filter(([_key, value]) => value !== null && value !== undefined)
        .html(([key, value]) => `<strong>${key}</strong>: ` + value)
    }

    const handleMouseover = (_event: MouseEvent, d: unknown) => {
      showTooltip()
      setContents(d as Datum, tooltipDiv)
    }

    const setPosition = (mouseX: number, mouseY: number) => {
      const OFFSET = 8

      tooltipDiv
        .style("top", mouseY < height / 2 ? `${mouseY + OFFSET}px` : "initial")
        .style(
          "right",
          mouseX > width / 2
            ? `${width - mouseX - marginLeft + OFFSET}px`
            : "initial",
        )
        .style(
          "bottom",
          mouseY > height / 2 ? `${height - mouseY + OFFSET}px` : "initial",
        )
        .style(
          "left",
          mouseX < width / 2 ? `${mouseX + OFFSET + marginLeft}px` : "initial",
        )
    }

    const handleMousemove = (event: MouseEvent) => {
      const [mouseX, mouseY] = d3.pointer(event)
      setPosition(mouseX - marginLeft, mouseY)
    }

    const hideTooltip = () => {
      tooltipDiv.style("display", "none")
    }

    const handleMouseleave = () => {
      hideTooltip()
    }

    selectionGroup.each((_d, i, nodes) => {
      d3.select(nodes[i])
        .on("mouseover.tooltip", handleMouseover)
        .on("mousemove.tooltip", handleMousemove)
        .on("mouseleave.tooltip", handleMouseleave)
    })
  }

  const setSize = () => {
    if (parentRef.current) {
      setWidth(parentRef.current.offsetWidth)
      setHeight(parentRef.current.offsetHeight)
    }
  }

  useEffect(() => {
    setSize()

    window.addEventListener("resize", setSize)

    return () => {
      window.removeEventListener("resize", setSize)
    }
  }, [])

  useEffect(() => {
    drawGraph()
  }, [width, height])

  return (
    <div
      ref={parentRef}
      style={{ width: containerWidth, height: containerHeight }}
      className="relative"
    >
      <svg ref={svgRef}></svg>
      <div
        id="line-tooltip"
        className="absolute box-border hidden w-40 rounded border bg-gray-50 p-1"
      ></div>
    </div>
  )
}

export default LinePlot
