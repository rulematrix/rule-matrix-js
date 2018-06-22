import * as d3 from 'd3';
import { Painter, defaultDuration } from '../Painters';
import { Feature } from './models';

export interface OptionalParams {
  duration: number;
  rotate: number;
  headerSize: number;
  margin: {left: number, right: number};
  maxHeight: number;
}

export interface HeaderParams extends Partial<OptionalParams> {
  onClick?: (feature: number) => void;
}

export default class HeaderPainter implements Painter<Feature[], HeaderParams> {
  public static defaultParams: OptionalParams = {
    duration: defaultDuration,
    rotate: -50,
    headerSize: 13,
    margin: {left: 1, right: 1},
    maxHeight: 80,
  };
  private features: Feature[];
  private params: HeaderParams & OptionalParams;
  constructor () {
    this.params = {...(HeaderPainter.defaultParams)};
  }
  update(params: HeaderParams): this {
    this.params = {...(HeaderPainter.defaultParams), ...(this.params), ...params};
    return this;
  }
  data(newData: Feature[]): this {
    this.features = newData;
    return this;
  }
  render<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, any, GElement, any>,
  ): this {
    const { duration, headerSize, rotate, margin, maxHeight, onClick } = this.params;
    const maxCount = d3.max(this.features, (f: Feature) => f.count);
    const multiplier = maxHeight / (maxCount || 5);
    /* TEXT GROUP */
    const textG = selector.selectAll('g.header').data(this.features);

    // ENTER
    const textGEnter = textG.enter().append('g').attr('class', 'header')
      .attr('transform', (d) => `translate(${d.x + d.width / 2},${-10}) rotate(${rotate})`);
    // Append rects
    textGEnter.append('rect').attr('class', 'header-bg')
      .attr('rx', 1).attr('ry', 1)
      .attr('height', headerSize * 1.3).attr('x', -2).attr('y', -headerSize);
    // Append texts
    textGEnter.append('text').attr('class', 'header-text').attr('text-anchor', 'start');

    // UPDATE
    const textGUpdate = textGEnter.merge(textG)
      .on('click', (onClick ? ((d: Feature) => onClick(d.feature)) : null) as null);
    textGUpdate.select('text.header-text').style('font-size', headerSize)
      .classed('header-expanded', d => Boolean(d.expanded))
      .text(d => `${d.text} (${d.count})`);

    // TRANSITION
    const updateTransition = textGUpdate.transition().duration(duration)
      .attr('transform', (d) => 
        `translate(${d.x + d.width / 2},${d.expanded ? -40 : -10}) rotate(${rotate})`
      );
    // Text transition
    updateTransition.select('text.header-text')
      .style('font-size', headerSize);
    // Rect transition
    updateTransition.select('rect.header-bg')
      .attr('height', headerSize * 1.3).attr('width', d => d.count * multiplier)
      .attr('y', -headerSize);
  
    // EXIT
    textG.exit().transition().duration(duration)
      .attr('transform', `translate(0,-10) rotate(${rotate})`).remove();

    /*AXIS*/
    const expandedFeatures = this.features.filter((f) => f.expanded);
    const axis = selector.selectAll('g.header-axis').data(expandedFeatures);
    // Enter + Merge
    const axisUpdate = axis.enter()
      .append('g').attr('class', 'header-axis')
      .merge(axis)
      .attr('transform', d => `translate(${d.x}, -5)`);

    axisUpdate.each((d: Feature, i: number, nodes) => {
      if (d.expanded) {
        let featureAxis = null;
        if (d.range && d.cutPoints) {
          const ticks = [d.range[0], ...(d.cutPoints), d.range[1]];
          const scale = d3.scaleLinear().domain(d.range).range([margin.left, d.width - margin.right]);
          featureAxis = d3.axisTop(scale).tickValues(ticks).tickSize(2);
        }
        if (d.categories) {
          const scale = d3.scalePoint().domain(d.categories).range([margin.left, d.width - margin.right]);
          featureAxis = d3.axisTop(scale).tickValues(d.categories).tickSize(2);
        }
        if (featureAxis)
          d3.select(nodes[i]).call(featureAxis)
            .selectAll('text').style('text-anchor', 'start')
            .attr('dx', '.4em')
            .attr('dy', '.5em')
            .attr('transform', 'rotate(-50)');
      } 
    });

    axis.exit().remove();

    return this;
  }
}