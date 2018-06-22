import * as d3 from 'd3';

import { ColorType, labelColor as defaultLabelColor, Painter } from '../Painters';
import { RuleX, ConditionX } from './models';
import { defaultDuration, HistPainter } from '../Painters';
import * as nt from '../../service/num';
import StreamPainter from '../Painters/StreamPainter';
import { isRuleGroup } from '../../models/ruleModel';

export interface ConditionPainterParams {
  // stream?: Stream;
  // interval?: [number, number];
  // streamColor?: ColorType;
  duration: number;
  color: ColorType;
}

// type ConditionData = (d: any, i: number ) => ConditionX;

export class ConditionPainter implements Painter<ConditionX, ConditionPainterParams> {
  private params: ConditionPainterParams;
  // private condition: ConditionX;
  private histPainter: HistPainter;
  private streamPainter: StreamPainter;
  constructor() {
    this.histPainter = new HistPainter();
    this.streamPainter = new StreamPainter();
  }
  update(params: ConditionPainterParams): this {
    this.params = {...(this.params), ...params};
    return this;
  }
  data(newData: ConditionX): this {
    // this.condition = newData;
    return this;
  }
  render<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGElement, ConditionX, GElement, any>,
  ): this {
    const {color, duration} = this.params;

    // Default BG Rect
    // const rects = selector.selectAll('rect.matrix-bg').data(c => ['data']);
    
    // rects.enter().append('rect').attr('class', 'matrix-bg');
    // rects.exit().transition().duration(duration).remove();

    selector.select('rect.matrix-bg')
      .classed('matrix-bg-active', c => Boolean(c.active))
      .attr('display', null)
      .transition().duration(duration)
      .attr('width', c => c.width).attr('height', c => c.height);

    // const text = selector.select('text.glyph-desc')
    //   .attr('text-anchor', 'middle').attr('font-size', 9);
    // text.transition().duration(duration)
    //   .attr('x', c => c.width / 2).attr('y', c => c.height - 2);
    // text.text(d => d.desc);

    // selector.selectAll('g.matrix-glyph').data(['g'])
    //   .enter().append('g').attr('class', 'matrix-glyph');
    // selector.selectAll('g.matrix-glyph-expand').data(['g'])
    //   .enter().append('g').attr('class', 'matrix-glyph-expand');
    
    selector.each((c: ConditionX, i, nodes) => {
      // const maskId = `mask-${c.ruleIdx}-${c.feature}-${c.category}`;
      const stream = c.stream;
      const paddingOut = c.expanded ? 5 : 1;
      const margin = {top: paddingOut, bottom: paddingOut, left: 1, right: 1};
      const params = {width: c.width, height: c.height, interval: c.interval, margin};
      const base = c.range[1] - c.range[0];
      const root = d3.select(nodes[i]);
      // // Make sure two groups exists
      // root.selectAll('g.matrix-glyph').data(['g'])
      //   .enter().append('g').attr('class', 'matrix-glyph');
      // root.selectAll('g.matrix-glyph-expand').data(['g'])
      //   .enter().append('g').attr('class', 'matrix-glyph-expand');
      // Groups
      const expandGlyph = root.select<SVGGElement>('g.matrix-glyph-expand');
      const glyph = root.select<SVGGElement>('g.matrix-glyph');
      const inputValue = root.selectAll('rect.glyph-value').data(c.value ? [c.value] : []);
      const inputValueUpdate = inputValue.enter()
        .append('rect').attr('class', 'glyph-value').attr('width', 2).attr('y', 0)
        .style('fill-opacity', 0.5)
        .merge(inputValue);
      inputValueUpdate.attr('x', v => (1 + (c.width - 2) / base * (v - c.range[0])))
        .attr('height', c.height)
        .style('fill', v => (c.interval[0] < v && v < c.interval[1]) ? '#52c41a' : '#f5222d')
        .style('stroke', 'none');
      inputValue.exit().remove();
      // console.log(c); // tslint:disable-line
      const xs = stream && stream.xs;
      let streamXs: number[] | undefined = xs;
      const yMax = stream && stream.yMax;
      let streamData: number[][] = [];
      if (c.expanded && stream && !c.isCategorical && xs) {
        const endPadding: number[] = new Array(stream.stream[0].length).fill(0);
        streamData = [endPadding, ...(stream.stream), endPadding];
        const step = xs[1] - xs[0];
        streamXs = [xs[0] - step / 2, ...xs, xs[xs.length - 1] + step / 2];
      }

      this.streamPainter
        .update({...params, xs: streamXs, yMax, color})
        .data(streamData)
        .render(expandGlyph);

      let padding = 0;
      if (c.isCategorical && stream) {
        const nBars = stream.stream.length;
        padding = c.width / (2 * nBars);
      }
      this.histPainter
        .update({padding, ...params, xs, yMax})
        .data(((!c.expanded || c.isCategorical) && stream) ? [stream.stream.map((s) => nt.sum(s))] : [])
        .render(glyph);
    });
    return this;
  }
}

export interface OptionalParams {
  labelColor: ColorType;
  duration: number;
  buttonSize: number;
  onClickButton: () => void;
}

export interface RuleRowParams extends Partial<OptionalParams> {
  // feature2Idx: (feature: number) => number;
  onClick?: (feature: number) => void;
  tooltip?: d3.Selection<SVGGElement, any, any, any>;
}

export default class RuleRowPainter implements Painter<RuleX, RuleRowParams> {
  public static defaultParams: OptionalParams = {
    labelColor: defaultLabelColor,
    duration: defaultDuration,
    buttonSize: 10,
    onClickButton: () => null,
  };
  private params: RuleRowParams & OptionalParams;
  private conditionPainter: ConditionPainter;
  private rule: RuleX;
  // private rule: RuleX;
  constructor() {
    this.conditionPainter = new ConditionPainter();
  }
  
  update(params: RuleRowParams): this {
    this.params = {...(RuleRowPainter.defaultParams), ...(this.params), ...params};
    return this;
  }
  data(newData: RuleX): this {
    this.rule = newData;
    return this;
  }
  render<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, RuleX, GElement, any>,
  ): this {
    const { duration, labelColor, onClick, tooltip } = this.params;
    const rule = this.rule; 

    // Background Rectangle
    const bgRect = selector.selectAll('rect.matrix-bg').data([this.rule]);
    const bgRectUpdate = bgRect.enter()
      .append('rect').attr('class', 'matrix-bg').attr('width', 0).attr('height', 0)
      .merge(bgRect);
    bgRectUpdate.classed('matrix-bg-highlight', d => Boolean(d.highlight));
    bgRectUpdate.transition().duration(duration)
      .attr('width', d => d.width).attr('height', d => d.height);
     
    // Button Group
    this.renderButton(selector);

    /* CONDITIONS */
    // JOIN
    const conditions = selector.selectAll<SVGGElement, ConditionX>('g.matrix-condition')
      .data(isRuleGroup(rule) ? [] : rule.conditions);

    // ENTER
    const conditionsEnter = conditions.enter()
      .append<SVGGElement>('g').attr('class', 'matrix-condition')
      .attr('transform', (c: ConditionX) => `translate(${c.x}, 0)`);
    
    conditionsEnter.append('rect').attr('class', 'matrix-bg');
    conditionsEnter.append('g').attr('class', 'matrix-glyph');
    conditionsEnter.append('g').attr('class', 'matrix-glyph-expand');
    // conditionsEnter.append('text').attr('class', 'glyph-desc');

    // UPDATE
    const conditionsUpdate = conditionsEnter.merge(conditions)
      .classed('hidden', false).classed('visible', true).attr('display', null);
    // conditionsUpdate.select('title').text(d => d.title);

    // Register listener to click for expanding
    if (onClick)
      conditionsUpdate.on('click', (c) => onClick(c.feature));
    // Transition
    conditionsUpdate
      .transition().duration(duration)
      .attr('transform', (c: ConditionX) => `translate(${c.x}, 0)`);
    
    this.conditionPainter.update({color: labelColor, duration})
      .render(conditionsUpdate);
    // conditionsUpdate.each((d: ConditionX, i, nodes) => 
    //   painter.data(d).render(d3.select(nodes[i]))
    // );

    // EXIT
    conditions.exit().classed('hidden', true)
      .transition().delay(300)
      .attr('display', 'none');

    // Add listeners to update tooltip
    if (tooltip) {
      const renderTooltip = (texts: string[]) => {
        // texts
        const tspan = tooltip.select('text').selectAll('tspan').data(texts);
        const tspanUpdate = tspan
          .enter().append('tspan').attr('x', 5).attr('dx', '0.1em').attr('dy', '1.2em')
          .merge(tspan);
        tspanUpdate.text(t => t);
        tspan.exit().remove();
        // rect-bg
        const textNode = tooltip.select('text').node() as SVGTextElement | null;
        const bBox = textNode ? textNode.getBBox() : null;
        const width = bBox ? bBox.width : 50;
        const height = bBox ? bBox.height : 20;
        const x = bBox ? bBox.x : 0;
        const y = bBox ? bBox.y : 0;
        // const height = textNode ? textNode.clientHeight : 0;

        tooltip.select('rect').attr('width', width + 10).attr('height', height * 1.2)
          .attr('y', y - height * 0.1).attr('x', x - 5);
        tooltip.attr('display', null);
      };
      const hideTooltip = () => tooltip.attr('display', 'none');

      conditionsUpdate.on('mouseover', (d: ConditionX) => renderTooltip([d.title]))
        .on('mouseout', hideTooltip);
      bgRectUpdate.on('mouseover', (d: RuleX) => renderTooltip(d.conditions.map(c => c.title)))
        .on('mouseout', hideTooltip);
    } else {
      conditionsUpdate.on('mouseover', null).on('mouseout', null);
    }
    return this;
  }

  renderButton(selector: d3.Selection<SVGGElement, {}, d3.BaseType, any>) {
    const { duration, buttonSize, onClickButton } = this.params;
    const rule = this.rule;

    // Enter
    const groupEnter = selector.selectAll('g.row-button').data(['rule']).enter()
      .append('g').attr('class', 'row-button');

    // Collapse Button Enter
    groupEnter.append('g').attr('class', 'collapse-button')
      .append('rect').attr('class', 'button-bg')
      .attr('height', buttonSize / 2).attr('y', -buttonSize / 4).attr('x', -2).attr('fill', 'white');

    // Rule Button Enter
    groupEnter.append('g').attr('class', 'rule-button')
      .append('text').attr('class', 'rule-no').attr('text-anchor', 'start').attr('dx', 2);

    const buttonRoot = selector.select<SVGGElement>('g.row-button');
    const collapseButton = buttonRoot.select<SVGGElement>('g.collapse-button');
    const ruleButton = buttonRoot.select<SVGGElement>('g.rule-button');

    if (!isRuleGroup(rule) && !rule.expanded ) {
      collapseButton.attr('display', 'none').on('click', null);
      ruleButton.attr('display', null);
      ruleButton.select('text.rule-no').attr('dy', rule.height / 2 + 6).text(rule.idx + 1);
      // selector.on('mouseover.button', () => {
      // }).on('mouseout.button', () => {
      //   ruleButton.select('text.rule-no').text('');
      // });

    } else {
      ruleButton.attr('display', 'none').on('mouseover.button', null).on('mouseout.button', null);
      collapseButton.attr('display', null)
        .on('click', onClickButton);
      collapseButton.transition().duration(duration)
        .attr('transform', `translate(${rule.expanded ? -20 : 4},${rule.height / 2})`);

      collapseButton.select('rect.button-bg').attr('width', 20);
        
      const rects = collapseButton.selectAll('rect.row-button')
        .data(isRuleGroup(rule) ? rule.rules : []);
      rects.exit().transition().duration(duration)
        .attr('fill-opacity', 1e-6).remove();

      if (isRuleGroup(rule)) {
        // const nNested = rule.rules.length;
        const height = 4;
        const width = 4;
        const step = width + 3;
        // const height = Math.min(rule.height / (2 * nNested - 1), 2);
        const rectsEnter = rects.enter()
          .append('rect').attr('class', 'row-button')
          .attr('rx', 2).attr('ry', 2)
          .attr('fill', '#bbb');
        rectsEnter
          .transition().duration(duration)
          .attr('x', (d, i) => buttonSize + 4 + i * step).attr('width', width)
          .attr('y', - height / 2).attr('height', height);
        collapseButton.select('rect.button-bg').attr('width', 20 + rule.rules.length * step);
      }
      collapseButton.selectAll('path.row-button')
        .data(['path']).enter().append('path')
        .attr('class', 'row-button')
        .attr('stroke-width', 2).attr('stroke', '#bbb').attr('fill', 'none');
      collapseButton.select('path.row-button').transition().duration(duration)
        .attr('d', rule.expanded 
          ? `M 0 ${buttonSize / 4} L ${buttonSize / 2} ${-buttonSize / 4} L ${buttonSize} ${buttonSize / 4}` 
          : `M 0 ${-buttonSize / 4} L ${buttonSize / 2} ${buttonSize / 4} L ${buttonSize} ${-buttonSize / 4}`);
    }
  }
    
}
