import * as d3 from 'd3';
import { Painter, ColorType, labelColor, defaultDuration } from './Painter';
import * as nt from '../../service/num';

import './HistPainter.css';

export type Hist = nt.Vector;

function checkBins(hists: Hist[]) {
  let nBins = hists[0].length;
  let equalBins: boolean = true;
  for (let i = 0; i < hists.length; ++i) {
    if (nBins !== hists[i].length) equalBins = false;
  }
  if (!equalBins) {
    console.warn('Hists not having the same number of bins!');
    hists.forEach(h => (nBins = Math.max(nBins, h.length)));
  }
  return { nBins, equalBins };
}

function brush(
  range: [number, number], 
  bars: d3.Selection<SVGRectElement, any, any, any>, 
  x: (d: any, i: number) => number
): void {
  bars.classed('hp-hist-active', (d, i) => {
    const pos = x(d, i);
    return range[0] <= pos && pos < range[1];
  });
}

// function packHists(hists: Hist[], pack: number = 1): Hist[] {
//   const histsPacked = hists.map((hist) => 
//   Array.from({length: Math.round(hist.length / pack)}, (_, i) => (
//     nt.sum(Array.from({length: pack}, (__, j) => hist[i * pack + j]))
//   )));
//   return histsPacked;
// }

interface LayoutParams {
  xs: number[];
  step: number;
  xScaler: (x: number) => number;
  yScaler: (y: number) => number;
  bandWidth: number;
  interval: [number, number];
}

function computeLayout(hists: Hist[], params: HistParams & OptionalParams): LayoutParams {
  const { width, height, margin, interval, padding, range } = params;
  const { nBins } = checkBins(hists);
  const xs = params.xs || d3.range(nBins);
  const step = xs[1] - xs[0];
  const xRange = range || [xs[0] - step / 2, xs[xs.length - 1] + step / 2];
  const yMax = Math.max(d3.max(hists, hist => d3.max(hist)) || 0, params.yMax || 0);
  const xScaler = d3
    .scaleLinear()
    .domain(xRange)
    .range([margin.left, width - margin.right]);
  const yScaler = d3
    .scaleLinear()
    .domain([yMax, 0])
    .range([margin.bottom, height - margin.top]);
  const bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
  const r0 = interval ? interval[0] : 0;
  const r1 = interval ? interval[1] : nBins;
  return {xs, step, xScaler, yScaler, bandWidth, interval: [r0, r1]};
}

export interface OptionalParams {
  color: ColorType;
  duration: number;
  mode: 'overlay' | 'stack';
  padding: number;
  margin: { top: number; bottom: number; left: number; right: number };
  height: number;
  width: number;
  opacity: number;
  // activeOpacity: number;
  // pack: number;
}

export interface HistParams extends Partial<OptionalParams> {
  interval?: [number, number];
  range?: [number, number];
  xs?: number[];
  yMax?: number;
}

export default class HistPainter implements Painter<Hist[], HistParams> {
  public static defaultParams: OptionalParams = {
    color: labelColor,
    duration: defaultDuration,
    mode: 'overlay',
    padding: 4,
    margin: { top: 5, bottom: 5, left: 5, right: 5 },
    height: 50,
    width: 100,
    opacity: 0.35,
    // activeOpacity: 0.7,
  };
  private params: HistParams & OptionalParams;
  private hists: Hist[];
  update(params: HistParams): this {
    this.params = { ...HistPainter.defaultParams, ...this.params, ...params };
    return this;
  }
  data(newData: Hist[]): this {
    this.hists = newData;
    return this;
  }

  render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, any, GElement, any>): this {
    switch (this.params.mode) {
      case 'overlay':
        this.renderOverlay(selector);
        break;
      case 'stack':
        this.renderStack(selector);
        break;
      default:
        break;
    }
    return this;
    
  }

  renderBrush<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGElement, Hist[], GElement, any>,
    xScaler?: (x: number) => number,
  ): this {
    const {interval, duration, margin, height} = this.params;

    const rangeRect = selector.selectAll('rect.hp-brush')
      .data((interval && this.hists.length) ? [interval] : []);
    
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

  renderOverlay<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, Hist[], GElement, any>): this {
    const { height, color, margin, duration, padding, opacity } = this.params;
    const hists = this.hists;
    // const histsPacked = packHists(hists, pack);
    const histG = selector.selectAll('g.hp-hists').data(hists);

    // Exit
    const exitTransition = histG
      .exit()
      .transition()
      .duration(duration)
      .remove();
    exitTransition.selectAll('rect').attr('y', height - margin.top).attr('height', 0);

    if (hists.length === 0) {
      this.renderBrush(selector);
      return this;
    }
  
    // Compute layout stuff
    const {xs, step, xScaler, yScaler, bandWidth, interval} = computeLayout(hists, this.params);
    // const { nBins } = checkBins(hists);
    // const xs = this.params.xs || d3.range(nBins);
    // const step = xs[1] - xs[0];
    // const xRange = range || [xs[0] - step / 2, xs[xs.length - 1] + step / 2];
    // const yMax = d3.max(hists, hist => d3.max(hist)) as number;
    // // const chartWidth = width - margin.left - margin.right;

    // const xScaler = d3
    //   .scaleLinear()
    //   .domain(xRange)
    //   .range([margin.left, width - margin.right]);
    // const yScaler = d3
    //   .scaleLinear()
    //   .domain([yMax, 0])
    //   .range([margin.bottom, height - margin.top]);
    // const hScaler = d3
    //   .scaleLinear()
    //   .domain([0, yMax])
    //   .range([0, height - margin.top - margin.bottom]);
    // const bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
    // const r0 = interval ? interval[0] : 0;
    // const r1 = interval ? interval[1] : nBins;

    // Enter
    const histGEnter = histG
      .enter()
      .append('g')
      .attr('class', 'hp-hists');
    // console.log(color(0), color(1)); // tslint:disable-line
    // Merge
    const histGUpdate = histGEnter.merge(histG);
    histGUpdate
      .transition()
      .duration(duration)
      .style('fill', (d, i) => color(i));

    /* RECTS START */
    const rects = histGUpdate
      .selectAll<SVGRectElement, number>('rect')
      .data((d: Hist) => Array.from(d, (v: number, i: number) => v));

    // Enter
    const rectsEnter = rects
      .enter()
      .append<SVGRectElement>('rect')
      .attr('x', (d, i) => xScaler(xs[i] - step / 2) + padding / 2)
      .attr('y', height - margin.top)
      .attr('fill-opacity', opacity)
      .attr('width', bandWidth)
      .attr('height', 0);

    // Update
    const rectsUpdate = rectsEnter
      .merge(rects);

    // Transition
    rectsUpdate
      .transition()
      .duration(duration)
      .attr('x', (d, i) => xScaler(xs[i] - step / 2) + padding / 2)
      .attr('y', yScaler)
      .attr('width', bandWidth)
      .attr('height', d => yScaler(0) - yScaler(d));

    brush(interval, rectsUpdate, (d, i) => xs[i]);

    // Rects Exit
    rects
      .exit()
      .transition()
      .duration(duration)
      .attr('y', height - margin.top)
      .attr('height', 0)
      .remove();

    /* RECTS END */

    // drawBrush
    this.renderBrush(selector, xScaler);
    return this;
  }

  renderStack<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, Hist[], GElement, any>): this {
    const { interval, width, height, color, margin, duration, padding } = this.params;
    const hists = this.hists;

    const histG = selector.selectAll('g.hp-hists').data(hists);

    // Exit
    const exitTransition = histG
      .exit()
      .transition()
      .duration(duration)
      .remove();
    exitTransition.attr('y', height - margin.top).attr('height', 0);

    if (hists.length === 0) {
      this.renderBrush(selector);
      return this;
    }

    const { nBins } = checkBins(hists);
    const xs = this.params.xs || d3.range(nBins);
    const y1s = nt.stack(hists);
    const y0s = [new Array(hists[0].length).fill(0), ...y1s.slice(0, -1)];
    const yMax = d3.max(y1s[y1s.length - 1]) as number;
    // const chartWidth = width - margin.left - margin.right;

    const xScaler = d3
      .scaleLinear()
      .domain([xs[0], xs[xs.length - 1]])
      .range([margin.left, width - margin.right]);
    const yScaler = d3
      .scaleLinear()
      .domain([yMax, 0])
      .range([margin.bottom, height - margin.top]);

    const bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
    const r0 = interval ? interval[0] : 0;
    const r1 = interval ? interval[1] : nBins;

    // Enter
    const histGEnter = histG
      .enter()
      .append('g')
      .attr('class', 'hists');
    // Merge
    const histGUpdate = histGEnter.merge(histG);
    histGUpdate
      .transition()
      .duration(duration)
      .style('fill', (d, i) => color(i));

    /* RECTS START */
    const rects = histGUpdate
      .selectAll<SVGRectElement, [number, number]>('rect')
      .data<[number, number]>((d: Hist, i: number) => 
        Array.from(d, (v: number, j: number) => [y0s[i][j], y1s[i][j]] as [number, number])
      );

    // Enter
    const rectsEnter = rects
      .enter()
      .append<SVGRectElement>('rect')
      .attr('y', height - margin.top)
      .attr('height', 0);

    // Update
    const rectsUpdate = rectsEnter
      .merge(rects)
      .attr('x', (d, i) => xScaler(xs[i]) + padding / 2)
      .attr('width', bandWidth);

    // Transition
    rectsUpdate
      .transition()
      .duration(duration)
      .attr('y', (d, i) => yScaler(d[1]))
      .attr('height', (d, i) => yScaler(d[0]) - yScaler(d[1]));

    if (interval) {
      brush([r0, r1], rectsUpdate, (d, i) => xs[i]);
    }

    // Rects Exit
    rects
      .exit()
      .transition()
      .duration(duration)
      .attr('y', height - margin.top)
      .attr('height', 0)
      .remove();

    /* RECTS END */

    // drawBrush
    this.renderBrush(selector, xScaler);
    return this;
  }
}
