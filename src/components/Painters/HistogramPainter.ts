// import * as d3 from 'd3';
// import { Painter, ColorType, defaultColor } from './Painter';
// import { Histogram } from '../../models';
// import './index.css';

// type Bar = [number, number, number];
// type Line = Bar[];

// interface OptionalParams {
//   width: number;
//   height: number;
//   color: ColorType;
// }

// export interface HistPainterParams extends Partial<OptionalParams> {
//   range?: [number | null, number | null];
//   min?: number;
//   max?: number;
// }

// function brushed(
//   range: [number, number], 
//   bars: d3.Selection<SVGRectElement, Bar, SVGGElement, Line>
// ) {
//   // const extent = d3.event.selection.map(x.invert, x);
//   bars.classed('feature-dist-area-highlight', (d: Bar) => (range[0] <= (d[0] + d[2]) && (d[0] - d[2]) <= range[1]));
// }

// export class HistogramPainter implements Painter<Histogram[], Partial<HistPainterParams>> {
//   public static defaultParams = {
//     width: 100,
//     height: 50,
//     color: defaultColor,
//   };
//   private params: HistPainterParams & OptionalParams;
//   private hists: Histogram[];
//   constructor() {
//     this.params = {...(HistogramPainter.defaultParams)};
//   }
//   public update(params: HistPainterParams) {
//     this.params = {...(HistogramPainter.defaultParams), ...(this.params), ...params};
//     return this;
//   }
//   public data(hists: Histogram[]) {
//     this.hists = hists;
//     return this;
//   }
//   public render(selector: d3.Selection<SVGElement, any, any, any>) {
//     const { width, height, color, range, min, max } = this.params;
//     const hists = this.hists;
//     const binSizes = hists.map((h: Histogram) => h.centers[1] - h.centers[0]);
//     const lineDataList: Line[] = this.hists.map((h: Histogram, i: number): Line => {
//       const binSize = h.centers[1] - h.centers[0];
//       return h.counts.map((count: number, j: number): Bar => {
//         return [h.centers[j] - binSize / 2, count, binSize];
//       });
//     });
//     const xMin = min ? min : Math.min(...(lineDataList.map((l, i) => l[0][0] - binSizes[i])));
//     const xMax = max ? max : Math.max(...(lineDataList.map((l, i) => l[l.length - 1][0] + binSizes[i])));
//     console.log(lineDataList); // tslint:disable-line
//     // console.log(xMin); // tslint:disable-line
//     // console.log(xMax); // tslint:disable-line
//     const xScale = d3
//       .scaleLinear()
//       .domain([xMin, xMax]) // input
//       .range([0, width]); // output
  
//     const yScale = d3
//       .scaleLinear()
//       .domain([0, Math.max(...hists.map(h => Math.max(...h.counts)))]) // input
//       .range([height / 2, 0]); // output
    
//     const hScale = d3
//       .scaleLinear()
//       .domain([0, Math.max(...hists.map(h => Math.max(...h.counts)))]) // input
//       .range([0, height]); // output
  
//     const lines = selector.selectAll<SVGGElement, null>('g.feature-dist-area')
//       .data(lineDataList);
//     const linesEnter = lines.enter().append<SVGGElement>('g')
//       .attr('class', 'feature-dist-area');
    
//     // UPDATE
//     const linesUpdate = linesEnter.merge(lines)
//       .style('fill', (d: Line, i: number) => color(i));
    
//     // Bars
//     const hist = linesUpdate.selectAll<SVGRectElement, Line>('rect.feature-dist-area')
//       .data<Bar>((l: Line): Bar[] => l);

//     const histEnter = hist.enter().append<SVGRectElement>('rect')
//       .attr('class', 'feature-dist-area');
    
//     // Bars Update
//     const histUpdate = histEnter.merge(hist);

//     histUpdate.transition().duration(400)
//       .attr('x', (d: Bar) => xScale(d[0]) + 2)
//       .attr('y', (d: Bar) => yScale(d[1]))
//       .attr('width', (d: Bar) => xScale(d[2]) - xScale(0) - 4)
//       .attr('height', (d: Bar) => hScale(d[1]));

//     // Brush
//     if (range) {
//       if (this.hists.length === 0) {
//         selector.selectAll('g.brush').remove();
//       } else {
//         selector.selectAll('g.brush').data(['brush'])
//           .enter().append('g').classed('brush', true);
//         const brushGroup = selector.select('g.brush');
//         const r0 = range[0];
//         const r1 = range[1];
//         const r = [r0 === null || r0 < xMin ? xMin : r0, r1 === null || r1 > xMax ? xMax : r1] as [number, number];
//         const brush = d3.brushX()
//           .extent([[xScale(r[0]), 0], [xScale(r[1]), height]]);
//         brushGroup.call(brush)
//           .call(brush.move, r.map(xScale));
//         // console.log(r); // tslint:disable-line
//         brushed(r, histUpdate);
//       }
//     }
//       // .attr('d', lineGenerator);

//     // Bars exit
//     hist.exit().transition().duration(400)
//       .attr('width', 0).attr('height', 0)
//       .style('fill-opacity', 1e-6).remove();
    
//     lines.exit()
//       .transition()
//       .duration(300)
//       .style('fill-opacity', 1e-6)
//       .remove();
    
//     return this;
//   }
// }
