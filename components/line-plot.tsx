import * as d3 from "d3"
import { useRef, useEffect, useState, MouseEvent } from "react"

type LinePlotProps = {
  data: { x: number; y: number }[]
  containerWidth?: number | string
  containerHeight?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
}

export default function LinePlot({
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

        svg.on("mousemove.crosshair", (e) => {
          const [mouseX, mouseY] = d3.pointer(event)

          // Remove lines
          d3.select(svgRef.current).select(".crosshair-x").remove()
          d3.select(svgRef.current).select(".crosshair-y").remove()

          if (
            mouseX > marginLeft &&
            mouseX < width - marginRight &&
            mouseY > marginTop &&
            mouseY < height - marginBottom
          ) {
            // Add lines
            svg
              .append("line")
              .style("stroke", "lightgray")

              .attr("class", "crosshair-x")
              .attr("y1", 0 + marginTop)
              .attr("y2", height - marginBottom)
              .attr("x1", mouseX)
              .attr("x2", mouseX)

            svg
              .append("line")
              .style("stroke", "lightgray")

              .attr("class", "crosshair-y")
              .attr("y1", mouseY)
              .attr("y2", mouseY)
              .attr("x1", 0 + marginLeft)
              .attr("x2", width - marginRight)
          }
        })

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

        // Add tooltip
        const tooltipDiv = d3.select("#line-tooltip")

        // Add circles
        const circles = svg
          .append("g")
          .selectAll("dot")
          .data(data)
          .join("circle")
          .attr("cx", (d) => x(d.x))
          .attr("cy", (d) => y(d.y))
          .call(tooltip, tooltipDiv)

        if (animate) {
          const lineNode = line.node()

          if (lineNode instanceof SVGPathElement) {
            const pathLength = lineNode.getTotalLength()

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
      }
    }
  }

  const getContainerSize = () => {
    if (parentRef.current) {
      setWidth(parentRef.current.offsetWidth)
      setHeight(parentRef.current.offsetHeight)
    }
  }

  const tooltip = (
    selectionGroup: d3.Selection<
      d3.BaseType | SVGCircleElement,
      {
        x: number
        y: number
      },
      SVGGElement,
      unknown
    >,
    tooltipDiv: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  ) => {
    selectionGroup.each((_d, i, nodes) => {
      d3.select(nodes[i])
        .on("mouseover.tooltip", () => {
          showTooltip()

          const datum = d3.select(nodes[i]).datum() as { x: number; y: number }
          setContents(datum, tooltipDiv)
        })
        .on("mousemove.tooltip", handleMousemove)
        .on("mouseleave.tooltip", handleMouseleave)
    })

    function handleMousemove(event: MouseEvent) {
      const [mouseX, mouseY] = d3.pointer(event)
      setPosition(mouseX - marginLeft, mouseY)
    }

    function handleMouseleave() {
      hideTooltip()
    }

    function showTooltip() {
      tooltipDiv.style("display", "block")
    }

    function hideTooltip() {
      tooltipDiv.style("display", "none")
    }

    function setPosition(mouseX: number, mouseY: number) {
      const MOUSE_POS_OFFSET = 8

      if (height && width) {
        tooltipDiv
          .style(
            "top",
            mouseY < height / 2 ? `${mouseY + MOUSE_POS_OFFSET}px` : "initial",
          )
          .style(
            "right",
            mouseX > width / 2
              ? `${width - mouseX - marginLeft + MOUSE_POS_OFFSET}px`
              : "initial",
          )
          .style(
            "bottom",
            mouseY > height / 2
              ? `${height - mouseY + MOUSE_POS_OFFSET}px`
              : "initial",
          )
          .style(
            "left",
            mouseX < width / 2
              ? `${mouseX + MOUSE_POS_OFFSET + marginLeft}px`
              : "initial",
          )
      }
    }
  }

  function setContents(
    datum: { x: number; y: number },
    tooltipDiv: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>,
  ) {
    tooltipDiv
      .selectAll("p")
      .data(Object.entries(datum))
      .join("p")
      .filter(([key, value]) => value !== null && value !== undefined)
      .html(([key, value]) => `<strong>${key}</strong>: ` + value)
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
      className="relative"
    >
      <svg ref={svgRef}></svg>
      <div
        id="line-tooltip"
        className="absolute box-border w-40 rounded border bg-gray-50 p-1"
      ></div>
    </div>
  )
}
