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

export default function LinePlot({
  data,
  containerWidth = "100%",
  containerHeight = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
}: LinePlotProps) {
  const gx = useRef<SVGSVGElement>(null)
  const gy = useRef<SVGSVGElement>(null)
  const points = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const parent = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const valuesX = data.map((datum) => datum.x)
  const domainX = d3.extent(valuesX) as number[]

  const valuesY = data.map((datum) => datum.y)
  const domainY = d3.extent(valuesY) as number[]

  const x = d3.scaleLinear(domainX, [marginLeft, width - marginRight])
  const y = d3
    .scaleLinear()
    .domain(domainY)
    .range([height - marginBottom, marginTop])

  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => x(d.x))
    .y((d) => y(d.y))
  const d = line(data) ?? undefined

  useEffect(() => {
    if (gx.current) {
      const svg = d3.select(gx.current)
      const axisBottom = d3.axisBottom(x)

      svg.call(axisBottom)

      if (points.current) {
        d3.select(points.current)
          .selectAll("circle")
          .transition()
          .duration(500)
          .attr("r", 2.5)
      }

      if (path.current) {
        const pathLength = path.current.getTotalLength()

        d3.select(path.current)
          .attr("stroke-dasharray", pathLength + " " + pathLength)
          .attr("stroke-dashoffset", pathLength)
          .transition()
          .duration(1500)
          .attr("stroke-dashoffset", 0)
      }
    }
  }, [gx, x])
  useEffect(() => {
    if (gy.current) {
      const svg = d3.select(gy.current)
      const axisLeft = d3.axisLeft(y)

      svg.call(axisLeft)
    }
  }, [gy, y])

  useEffect(() => {
    setWidth(parent.current!.clientWidth)
    setHeight(parent.current!.clientHeight)

    const handleResize = () => {
      setWidth(parent.current!.clientWidth)
      setHeight(parent.current!.clientHeight)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div
      ref={parent}
      style={{ width: containerWidth, height: containerHeight }}
    >
      <svg width={width} height={height}>
        <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
        <g ref={gy} transform={`translate(${marginLeft},0)`} />

        <path
          ref={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          d={d}
        />

        <g ref={points} fill="white" stroke="currentColor" strokeWidth="1.5">
          {data.map((d, i) => (
            <circle key={i} cx={x(d.x)} cy={y(d.y)} />
          ))}
        </g>
      </svg>
    </div>
  )
}
