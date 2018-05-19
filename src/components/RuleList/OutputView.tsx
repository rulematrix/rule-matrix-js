import * as React from 'react';
import * as d3 from 'd3';
import './index.css';

export interface OutputViewProps {
  transform: string;
  width: number;
  height: number;
  output: number[];
  support: number[];
  maxSupport: number;
  barWidth: number;
  interval: number;
  labels?: (i: number) => string;
  colors?: d3.ScaleOrdinal<number, string>;
}

export interface OutputViewState {
}

export default class OutputView extends React.Component<OutputViewProps, OutputViewState> {
  margin: {bottom: number, top: number};
  colors: d3.ScaleOrdinal<number, string>;
  arrowSize: number;
  textWidth: number;
  constructor(props: OutputViewProps) {
    super(props);
    this.margin = {bottom: 15, top: 5};
    this.state = {};
    this.colors = props.colors || d3.scaleOrdinal<number, string>(d3.schemeCategory10);
    this.arrowSize = 12;
    this.textWidth = 50;
  }
  renderArrow(size: number, transform: string) {
    return (
      <path d={`M 0 0 L ${size / 2} ${size / 2} L 0 ${size}`} className="arrow" transform={transform} />
    );
  }
  renderBar(bars: number[]) {
    const {barWidth, interval, width, height} = this.props;
    const {colors, arrowSize, textWidth} = this;
    const delta = barWidth + interval;
    const chartHeight = bars.length * delta + interval;
    const chartWidth = width - arrowSize - textWidth - 20;
    const xScale = d3.scaleLinear().domain([0.0, 1.0]).range([0, chartWidth]);
    const labels = this.props.labels || ((i: number) => `L${i}`);
    let yShift = (height - chartHeight) / 2;
    // yShift = yShift < margin.top ? margin.top : yShift;
    return (
      <g transform={`translate(${arrowSize + textWidth},${yShift})`}>
        <path d={`M 0 0 v ${delta * bars.length + interval}`} strokeWidth="1px" stroke="#000" />
        {bars.map((bar: number, i: number) => (
          <g transform={`translate(0, ${delta * i + interval})`} key={i}>
            <rect width={xScale(bar)} height={barWidth} fill={colors(i)} fillOpacity={0.5}/>
            <text textAnchor="start" x={4} y={barWidth - 2} fontSize="10" >
              {Math.round(bar * 1000) / 1000}
            </text>
            <text textAnchor="end" x={-2} y={barWidth - 2} fontSize="11" >
              {labels(i)}
            </text>
          </g>
        ))}
      </g>
    );
  }
  renderSupport(support: number[], maxSupport: number, width: number) {
    let totalSupport = 0;
    // support.forEach(s => {
    //   totalSupport += s;
    // });
    const xScale = d3.scaleLinear().domain([0, maxSupport]).range([0, width]);
    return (
      <g> 
        {support.map((s: number, i: number) => {
          const x = xScale(totalSupport);
          totalSupport += s;
          return (
            <rect key={i} x={x} width={xScale(s)} height={5}/>
          );
        })}
        <text>Support:</text>
        <text>{totalSupport}</text>
      </g>
    );
  }
  render() {
    const {transform, output, height} = this.props;

    return (
      <g transform={transform}>
        {this.renderArrow(this.arrowSize, `translate(0, ${(height - this.arrowSize) / 2})`)}
        {this.renderBar(output)}
      </g>
    );
  }
}
