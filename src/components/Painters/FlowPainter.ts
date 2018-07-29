import * as nt from '../../service/num';
import { ColorType, Painter, labelColor, defaultDuration } from './index';

import './FlowPainter.css';

type Point = {x: number, y: number};
const originPoint = {x: 0, y: 0};

const curve = (s: Point = originPoint, t: Point = originPoint): string => {
  let dy = t.y - s.y;
  let dx = t.x - s.x;
  const r = Math.min(Math.abs(dx), Math.abs(dy));
  if (Math.abs(dx) > Math.abs(dy))
    return `M${s.x},${s.y} A${r},${r} 0 0 0 ${s.x + r} ${t.y} H ${t.x}`;
  else
    return `M ${s.x},${s.y} V ${s.y - r} A${r},${r} 0 0 0 ${t.x} ${t.y} `;
};

const flowCurve = (d?: {s: Point, t: Point}): string => {
  if (d) return curve(d.s, d.t);
  return curve();
};

// function drawRects()

export interface FlowOptional {
  width: number;
  dx: number;
  dy: number;
  height: number;
  duration: number;
  color: ColorType;
  // testHeight: number;
  divideHeight: number;
}

export interface FlowPainterParams extends Partial<FlowOptional> {}

type Rect = {x: number, width: number, height: number};

type Path = {s: Point, t: Point, width: number};

// type FlowData = { width: number; shift: number; height: number; y: number };

export type Flow = {support: number[], y: number};

export default class FlowPainter implements Painter<Flow[], FlowPainterParams> {
  public static defaultParams: FlowOptional = {
    width: 100,
    height: 50,
    duration: defaultDuration,
    dy: -30,
    dx: -40,
    color: labelColor,
    divideHeight: 8,
    // fontSize: 12,
    // multiplier: 1.0,
  };
  private params: FlowPainterParams & FlowOptional;
  private flows: Flow[];
  // private totalFlows: number[];
  private flowSums: number[];
  private reserves: number[][];
  private reserveSums: number[];
  public update(params: FlowPainterParams) {
    this.params = { ...FlowPainter.defaultParams, ...this.params, ...params };
    return this;
  }
  public data(flows: Flow[]) {
    this.flows = flows;
    const nClasses = flows.length > 0 ? flows[0].support.length : 0;
    this.flowSums = flows.map((r: Flow) => nt.sum(r.support));

    let reserves: number[][] = 
      Array.from({length: nClasses}, (_, i) => flows.map(flow => flow.support[i]));
    reserves = reserves.map(reserve => nt.cumsum(reserve.reverse()).reverse());
    this.reserveSums = new Array(flows.length).fill(0);
    reserves.forEach(reserve => nt.add(this.reserveSums, reserve, false));

    // const multiplier = width / reserveSums[0];
    this.reserves = Array.from({length: flows.length}, (_, i) => reserves.map(reserve => reserve[i]));

    // console.log(this.reserves); // tslint:disable-line
    // console.log(this.reserveSums); // tslint:disable-line
    return this;
  }
  public render(selector: d3.Selection<SVGGElement, any, any, any>): this {
    // const {width} = this.params;
    // Make sure the root group exits
    // selector
    //   .selectAll('g.flows')
    //   .data(['flows'])
    //   .enter()
    //   .append('g')
    //   .attr('class', 'flows');
    // const rootGroup = selector.select<SVGGElement>('g.flows')
    //   .attr('transform', `translate(${-width}, 0)`);

    // Render Rects
    this.renderRects(selector);

    // Render Flows
    this.renderFlows(selector);
    
    return this;
  }

  public renderRects(root: d3.Selection<SVGGElement, any, any, any>): this {
    const {duration, height, width, dy, color, divideHeight} = this.params;
    const {flows, reserves, reserveSums} = this;
    // Compute pos
    const heights = flows.map((f, i) => i > 0 ? f.y - flows[i - 1].y : height);
    const multiplier = width / reserveSums[0];

    // JOIN
    const reserve = root.selectAll('g.v-reserves').data(flows);

    // ENTER
    const reserveEnter = reserve.enter().append('g').attr('class', 'v-reserves');
    reserveEnter.append('title');

    reserveEnter.append('rect').attr('class', 'v-divide')
      .attr('rx', 3).attr('ry', 3);

    // UPDATE
    const reserveUpdate = reserveEnter.merge(reserve);
    reserveUpdate.select('title').text((d, i) => reserves[i].join('/'));
    reserveUpdate.select('rect.v-divide')
      .attr('width', (d, i) => reserveSums[i] * multiplier + 4).attr('x', -2)
      .attr('y', (d, i) => heights[i] - divideHeight)
      .attr('height', divideHeight);
    // Transition groups
    reserveUpdate.transition().duration(duration)
      .attr('transform', (d: Flow, i: number) => `translate(0,${d.y - heights[i] - dy})`);

    // EXIT
    reserve.exit().transition().duration(duration)
      .attr('transform', 'translate(0,0)').remove();
    
    // *RECTS START*
    // JOIN RECT DATA
    // console.warn(reserves);
    const rects = reserveUpdate.selectAll('rect.v-reserve')
      .data<Rect>((d: Flow, i: number) => {
        const widths = reserves[i].map((r) => r * multiplier);
        const xs = [0, ...(nt.cumsum(widths.slice(0, -1)))];
        return d.support.map((s: number, j: number) => {
          return {
            width: widths[j], height: heights[i] - divideHeight, x: xs[j]
          };
        });
      });
    
    // RECT ENTER
    const rectsEnter = rects.enter()
      .append('rect').attr('class', 'v-reserve')
      .attr('width', d => d.width);
      
    // RECT UPDATE
    const rectsUpdate = rectsEnter.merge(rects)
      .style('fill', (d, i) => color(i));
    rectsUpdate.transition().duration(duration)
      .attr('width', d => d.width).attr('height', d => d.height).attr('x', d => d.x);
    
    // RECT EXIT
    rects.exit().transition().duration(duration)
      .attr('height', 1e-6).remove();
    // *RECTS END*

    return this;
  }

  public renderFlows(root: d3.Selection<SVGGElement, any, any, any>): this {
    const {duration, width, dy, dx, color} = this.params;
    const {flows, reserves, reserveSums, flowSums} = this;
    // Compute pos
    // const heights = flows.map((f, i) => i > 0 ? f.y - flows[i - 1].y : height);
    const multiplier = width / reserveSums[0];

    // JOIN
    const flow = root.selectAll('g.v-flows').data(flows);

    // ENTER
    const flowEnter = flow.enter().append('g').attr('class', 'v-flows');
    flowEnter.append('title');
    // UPDATE
    const flowUpdate = flowEnter.merge(flow);
    flowUpdate.select('title').text(d => d.support.join('/'));
    // Transition groups
    flowUpdate.transition().duration(duration)
      .attr('transform', (d: Flow, i: number) => `translate(0,${d.y})`);

    // EXIT
    flow.exit().transition().duration(duration)
      .attr('transform', 'translate(0,0)').remove();
    
    // *PATHS START*
    // JOIN PATH DATA
    const paths = flowUpdate.selectAll('path')
      .data<Path>((d: Flow, i: number) => {
        let x0 = ((i === reserves.length - 1) ? 0 : reserveSums[i + 1]) * multiplier;
        let y1 = flowSums[i] * multiplier / 2;
        return flows[i].support.map((f: number) => {
          const pathWidth = f * multiplier;
          const s = {x: x0 + pathWidth / 2, y: -dy};
          const t = {x: dx + width, y: y1 - pathWidth / 2};
          x0 += pathWidth;
          y1 -= pathWidth;
          return {s, t, width: pathWidth};
        });
      });
    
    // PATH ENTER
    const pathsEnter = paths.enter()
      .append('path')
      .attr('d', flowCurve())
      .style('stroke-width', 1e-6);
      
    // PATH UPDATE
    const pathsUpdate = pathsEnter.merge(paths)
      .style('stroke', (d, i) => color(i));
    pathsUpdate.transition().duration(duration)
      .attr('d', flowCurve)
      .style('stroke-width', d => `${d.width}px`);
    
    // PATH EXIT
    paths.exit().transition().duration(duration)
      .attr('d', flowCurve()).style('stroke-width', 1e-6)
      .remove();
    // *PATHS END*

    return this;
  }
  // private updatePos() {
  //   const {outFlows, reserves, reserveSums} = this;
  //   // const heights = ys.map
  // }
}