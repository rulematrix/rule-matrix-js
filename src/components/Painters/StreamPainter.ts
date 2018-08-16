import * as d3 from 'd3';
import { Painter, ColorType, defaultColor, defaultDuration } from './Painter';
// import * as nt from '../../service/num';

import './HistPainter.css';

export type Section = number[] | Int32Array;

// function brush(range: [number, number], bars: d3.Selection<SVGRectElement, any, any, any>, pack: number = 1) {
//   bars.classed('hp-hist-active', (d, i) => range[0] <= (i * pack) && (i * pack) < range[1]);
// }

export interface OptionalParams {
  color: ColorType;
  duration: number;
  // mode: 'overlay' | 'stack';
  // padding: number;
  margin: { top: number; bottom: number; left: number; right: number };
  height: number;
  width: number;
}

export interface StreamParams extends Partial<OptionalParams> {
  interval?: [number, number];
  range?: [number, number];
  xs?: number[];
  yMax?: number;
}

export default class StreamPainter implements Painter<Section[], StreamParams> {
  public static defaultParams: OptionalParams = {
    color: defaultColor,
    duration: defaultDuration,
    // mode: 'overlay',
    // padding: 4,
    margin: { top: 5, bottom: 5, left: 5, right: 5 },
    height: 50,
    width: 100,
  };
  private params: StreamParams & OptionalParams;
  private stream: Section[];
  private initPos: string | null;
  constructor() {
    this.params = {...(StreamPainter.defaultParams)};
  }
  update(params: StreamParams): this {
    this.params = { ...(StreamPainter.defaultParams), ...(this.params), ...params };
    return this;
  }
  data(newData: Section[]): this {
    this.stream = newData;
    return this;
  }

  render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, any, GElement, any>): this {
    const {margin, color, duration, width, height, range} = this.params;
    const streamData = this.stream;
    let xs = this.params.xs || d3.range(streamData.length);
    // const step = xs[1] - xs[0];
    const xRange = range || [xs[0], xs[xs.length - 1]];
    // xs = [xRange[0], ...xs, xRange[1]];
    const nStreams = streamData.length ? streamData[0].length : 0;

    const stackLayout = d3.stack<Section, number>()
      .keys(d3.range(nStreams)).offset(d3.stackOffsetSilhouette);

    const stackedStream = stackLayout(streamData) as [number, number][][];
    const yMin = d3.min(stackedStream, (stream) => d3.min(stream, (d) => d[0])) || 0;
    const yMax = d3.max(stackedStream, (stream) => d3.max(stream, (d) => d[1])) || 0;
    const diff = Math.max(0, (this.params.yMax || 0) - (yMax - yMin));
    // if (streamData.length) {
    //   console.log(yMax); // tslint:disable-line
    //   console.log(yMin); // tslint:disable-line
    //   console.log(diff);  // tslint:disable-line
    //   console.log(streamData.map(s => nt.sum(s))); // tslint:disable-line
    // }

    const xScaler = d3.scaleLinear()
      .domain(xRange).range([margin.left, width - margin.right]);
    const yScaler = d3.scaleLinear()
      .domain([yMin - diff / 2, yMax + diff / 2]).range([margin.bottom, height - margin.top]);
    const area = d3.area<[number, number]>()
      .x((d, i) => xScaler(xs[i]))
      .y0((d, i) => yScaler(d[0]))
      .y1((d, i) => yScaler(d[1]))
      .curve(d3.curveCardinal.tension(0.3));

    const initPos = area(new Array<[number, number]>(streamData.length).fill([0, 1e-6]));
    // Join
    const paths = selector.selectAll('path').data(stackedStream);
    // Enter
    const pathEnter = paths.enter().append('path')
      .attr('d', initPos as string);
    // Update
    const pathUpdate = pathEnter.merge(paths).style('fill', (d, i) => color(i));
    pathUpdate.transition().duration(duration)
      .attr('d', area);
    // Exit
    paths.exit().transition().duration(duration)
      .attr('d', this.initPos as string).remove();
    this.renderBrush(selector, xScaler);
    this.initPos = initPos;
    return this;
  }

  renderBrush<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGElement, Section[], GElement, any>,
    xScaler?: d3.ScaleLinear<number, number>,
  ): this {
    const {interval, duration, margin, height} = this.params;

    const rangeRect = selector.selectAll('rect.hp-brush')
      .data((interval && this.stream.length) ? [interval] : []);
    
    rangeRect.exit().transition().duration(duration)
      .attr('height', 1e-6).attr('y', height / 2).remove();

    if (!(interval && xScaler)) return this;
    const rangeEnter = rangeRect.enter().append('rect').attr('class', 'hp-brush');
    const rangeUpdate = rangeEnter.merge(rangeRect);
    rangeUpdate.transition().duration(duration)
    .attr('width', xScaler(interval[1]) - xScaler(interval[0])).attr('x', xScaler(interval[0]))
    .attr('height', height - margin.top - margin.bottom).attr('y', margin.top);

    return this;
  }

}
