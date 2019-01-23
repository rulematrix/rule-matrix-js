import * as d3 from 'd3';
import { Painter, ColorType, defaultColor } from './Painter';
import { Histogram } from '../../models';
import './index.css';

type Point = [number, number];
type Line = Point[];

export interface OptionalParams {
  width: number;
  height: number;
  color: ColorType;
  hasAxis: boolean;
}

export interface AreaPainterParams extends Partial<OptionalParams> {
  // min?: number;
  // max?: number;
}

export class AreaPainter implements Painter<Histogram[], Partial<AreaPainterParams>> {
  public static defaultParams = {
    width: 100,
    height: 50,
    color: defaultColor,
    hasAxis: false,
  };
  private params: AreaPainterParams & OptionalParams;
  private hists: Histogram[];
  constructor() {
    this.params = {...(AreaPainter.defaultParams)};
  }
  public update(params: AreaPainterParams) {
    this.params = {...(AreaPainter.defaultParams), ...(this.params), ...params};
    return this;
  }
  public data(hists: Histogram[]) {
    this.hists = hists;
    return this;
  }
  public render(selector: d3.Selection<SVGElement, any, any, any>) {
    const { width, height, color, hasAxis } = this.params;
    const hists = this.hists;
    const binSizes = 1;
    const lineDataList: Line[] = this.hists.map((hist): Line => {
      return hist.map((count: number, i: number): [number, number] => {
        return [i, count];
      });
    });
    const xMin = Math.min(...(lineDataList.map((line, i) => line[0][0] - binSizes[i])));
    const xMax = Math.max(...(lineDataList.map((line, i) => line[line.length - 1][0] + binSizes[i])));
    // console.log(lineDataList); // tslint:disable-line
    // console.log(xMin); // tslint:disable-line
    // console.log(xMax); // tslint:disable-line
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax]) // input
      .range([1, width - 1]); // output

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(...hists.map(hist => Math.max(...hist)))]) // input
      .range([height, 0]); // output

    const lineGenerator = d3
      .line<[number, number]>()
      .x((d: number[]): number => xScale(d[0]))
      .y((d: number[]): number => yScale(d[1]))
      .curve(d3.curveNatural);
    // .curve(d3.curveCardinal.tension(tension));
    // const lineStrings = lineDataList.map(lineData => line(lineData));
    const areaGenerator = d3
      .area<[number, number]>()
      .x((d: number[]): number => xScale(d[0]))
      .y1((d: number[]): number => yScale(d[1]))
      .y0(yScale(0))
      .curve(d3.curveNatural);
    // const areaStrings = lineDataList.map(lineData => area(lineData));

    const lines = selector.selectAll<SVGPathElement, Line[]>('.feature-dist')
      .data(lineDataList);
    const enterLines = lines.enter()
      .append('path')
      .attr('class', 'feature-dist')
      .style('stroke', (d: Line, i: number) => color(i));

    enterLines.merge(lines)
      .attr('d', lineGenerator);

    lines.exit()
      .transition()
      .duration(300)
      .style('stroke-opacity', 1e-6)
      .remove();

    const areas = selector.selectAll<SVGPathElement, Line[]>('.feature-dist-area')
      .data(lineDataList);

    const enterAreas = areas.enter()
      .append('path')
      .classed('feature-dist-area', true)
      .style('fill', (d: Line, i: number) => color(i));
    enterAreas.merge(areas)
      .attr('d', areaGenerator);

    areas.exit()
      .transition()
      .duration(300)
      .style('fill-opacity', 1e-6)
      .remove();

    const axis = selector.selectAll('g')
      .data(hasAxis ? ['x-axis', 'y-axis'] : []);
    axis
      .enter().append('g').attr('class', d => d);
    selector.select('g.x-axis')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(3)
      );
    selector.select('g.y-axis')
      .attr('transform', `translate(0,0)`)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(2)
          .tickSize(3)
      );
    axis.exit().remove();
    return this;
  }
}
