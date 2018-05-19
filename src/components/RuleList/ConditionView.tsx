import * as React from 'react';
import * as d3 from 'd3';
import './index.css';

import { Histogram } from '../../models';

// const MAX_NUM_RULES = 3;
const MAX_STR_LEN = 16;
const CUT_SIZE = (MAX_STR_LEN - 2) / 2;
const fontSize = 12;
// const tension = 0.3;
export const collapsedHeight = fontSize * 2;
export const expandedHeight = collapsedHeight + 80;

export interface ConditionViewProps {
  featureName: string;
  category: (number | null)[] | number;
  hist?: Histogram[];
  width: number;
  min: number;
  max: number;
  ratios: [number, number, number];
  transform: string;
  activated: boolean;
  onMouseEnter?: React.MouseEventHandler<SVGGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGGElement>;
  onClick?: React.MouseEventHandler<SVGGElement>;
  collapsed?: boolean;
  colors?: d3.ScaleOrdinal<number, string>;
}

const defaultColors = d3.scaleOrdinal<number, string>(d3.schemeCategory10);

export interface ConditionViewState {
  // activated: boolean;
}

function condition2String(featureName: string, category: (number | null)[] | number): { tspan: string; title: string } {
  const abrString = featureName.length > MAX_STR_LEN
    ? `"${featureName.substr(0, CUT_SIZE)}…${featureName.substr(-CUT_SIZE, CUT_SIZE)}"`
    : featureName;
  let featureMap = (feature: string): string => `${feature} is any`;
  if (typeof category === 'number') {
    featureMap = (feature: string) => `${feature} = ${category}`;
  } else {
    const low = category[0];
    const high = category[1];
    if (low === null && high === null) featureMap = (feature: string) => `${feature} is any`;
    else {
      const lowString = low !== null ? `${low.toPrecision(3)} < ` : '';
      const highString = high !== null ? ` < ${high.toPrecision(3)}` : '';
      featureMap = (feature: string) => lowString + feature + highString;
    }
  }
  return {
    tspan: featureMap(abrString),
    title: featureMap(featureName)
  };
}

function interval2Range(interval: (number | null)[], min: number, max: number): { low: number; high: number } {
  let low = (interval[0] === null ? min : interval[0]) as number;
  const high = (interval[1] === null ? max : interval[1]) as number;
  return { high, low };
}

// type Range = [number, number];

export default class ConditionView extends React.Component<ConditionViewProps, ConditionViewState> {
  // refCounts: number;
  xAxisRef: SVGGElement;
  yAxisRef: SVGGElement;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  margin: { top: number; bottom: number; left: number; right: number };

  constructor(props: ConditionViewProps) {
    super(props);
    this.state = { activated: false };
    this.margin = { top: 10, bottom: 35, left: 25, right: 10 };
  }

  renderHist(hists: Histogram[]) {
    const margin = this.margin;
    const { width, category, min, max, colors } = this.props;
    // const interval = hist.centers[1] - hist.centers[0];
    const colorFn = colors ? colors : defaultColors;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = expandedHeight - margin.top - margin.bottom;
    const lineDataList: [number, number][][] = hists.map((hist): [number, number][] => {
      const lineData: [number, number][] = hist.map((count: number, i: number): [number, number] => {
        return [i, count];
      });
      // this.min = hist.centers[0] - interval / 2;
      // this.max = hist.centers[nBins - 1] + interval / 2;
      return [[min, 0], ...lineData, [max, 0]];
    });
    
    const xScale = d3
      .scaleLinear()
      .domain([min, max]) // input
      .range([1, chartWidth - 1]); // output

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(...(hists.map((hist) => Math.max(...hist))))]) // input
      .range([chartHeight, 0]); // output

    this.xScale = xScale;
    this.yScale = yScale;

    const line = d3
      .line<[number, number]>()
      .x((d: number[]): number => xScale(d[0]))
      .y((d: number[]): number => yScale(d[1]))
      .curve(d3.curveNatural);
      // .curve(d3.curveCardinal.tension(tension));
    const lineStrings = lineDataList.map((lineData) => line(lineData));
    const area = d3
      .area<[number, number]>()
      .x((d: number[]): number => xScale(d[0]))
      .y1((d: number[]): number => yScale(d[1]))
      .y0(yScale(0))
      .curve(d3.curveNatural);
    const areaStrings = lineDataList.map((lineData) => area(lineData));

    // if (lineString === null || areaString === null) return '';
    let highLightedArea = null;
    // let highLightedLineString = null;
    if (typeof category !== 'number') {
      const { low, high } = interval2Range(category, min, max);
      highLightedArea = (
        <g>
          <path d={`M ${xScale(low)} 0 v ${chartHeight}`} className="feature-dist-highlight" />
          <path d={`M ${xScale(high)} 0 v ${chartHeight}`} className="feature-dist-highlight" />
          <rect
            x={xScale(low)}
            y={0}
            width={xScale(high) - xScale(low)}
            height={chartHeight}
            className="feature-dist-area-highlight"
          />
        </g>
      );
    }
    return (
      <g transform={`translate(${margin.left},${margin.top})`}>
        {areaStrings.map((areaString: string, i: number) => {
          return areaString && (
            <path className="feature-dist-area" d={areaString} fill={colorFn(i)} />
          );
        })}
        {lineStrings.map((lineString: string, i: number) => {
          return lineString && (
            <path className="feature-dist" d={lineString} stroke={colorFn(i)} />
          );
        })}
        {/* {highLightedAreaString && <path className="feature-dist-area-highlight" d={highLightedAreaString} />} */}
        {highLightedArea}
        <g ref={(ref: SVGGElement) => (this.xAxisRef = ref)} />
        <g ref={(ref: SVGGElement) => (this.yAxisRef = ref)} />
      </g>
    );
  }
  renderHistAxis() {
    d3
      .select(this.xAxisRef)
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.yScale(0)})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .ticks(5)
          .tickSize(3)
      );
    d3
      .select(this.yAxisRef)
      .attr('class', 'y-axis')
      .attr('transform', `translate(0,0)`)
      .call(
        d3
          .axisLeft(this.yScale)
          .ticks(2)
          .tickSize(3)
      );
  }
  renderCondition() {
    const { featureName, category, width, activated, ratios, collapsed } = this.props;
    const { margin } = this;
    const totalHeight = collapsed ? collapsedHeight : expandedHeight;
    const cHeight = Math.ceil(fontSize * 1.5);
    const cWidth = width - margin.left - margin.right;
    const {tspan, title} = condition2String(featureName, category);
    let rangeWidth: number = cWidth * ratios[1];
    let rangeX: number = cWidth * ratios[0];
    return (
      <g transform={`translate(${margin.left},${totalHeight - fontSize * 0.25})`}>
        <rect
          y={-cHeight}
          width={cWidth}
          height={cHeight}
          className={activated ? 'bg-rect-active' : 'bg-rect'}
        />
        <rect x={rangeX + 1} y={1 - cHeight} width={rangeWidth - 2} height={cHeight - 2} className="range-rect" />
        <text x={cWidth / 2} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize}>
          <tspan>{tspan}</tspan>
          <title>{title}</title>
        </text>
      </g>
    );
  }
  componentDidUpdate() {
    // Hack: make sure the element is already mounted, then render the axis
    if (this.props.hist !== undefined && !this.props.collapsed) this.renderHistAxis();
  }
  render() {
    const { transform, hist, collapsed } = this.props;
    const { onMouseEnter, onMouseLeave, onClick } = this.props;
    return (
      <g transform={transform} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
        {this.renderCondition()}
        {hist !== undefined && !collapsed && this.renderHist(hist)}
      </g>
    );
  }
}
