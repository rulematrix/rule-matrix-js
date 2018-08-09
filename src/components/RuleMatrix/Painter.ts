import * as d3 from 'd3';
import { ColorType, Painter, labelColor, defaultDuration } from '../Painters';
import * as nt from '../../service/num';
import { Rule, Streams, isRuleGroup, RuleList, groupRules, rankRuleFeatures } from '../../models';
import RowPainter from './RowPainter';
import { RuleX, ConditionX, Feature } from './models';
import { ConditionalStreams, isConditionalStreams, groupBySupport } from '../../models';
import FlowPainter from './FlowPainter';
import OutputPainter from './OutputPainter';
import HeaderPainter from './HeaderPainter';

export function flattenRules(rules: Rule[]): Rule[] {
  const ret: Rule[] = [];
  rules.forEach((r) => {
    ret.push(r);
    if (isRuleGroup(r)) ret.push(...(r.rules.slice(1)));
  });
  return ret;
}

function computeExistingFeatures(rules: Rule[], nFeatures: number) {
  const featureCounts = new Array(nFeatures).fill(0);
  for (let i = 0; i < rules.length - 1; ++i) {
    if (isRuleGroup(rules[i])) continue; // do not display the these features
    const conditions = rules[i].conditions;
    for (let j = 0; j < conditions.length; ++j) {
      featureCounts[conditions[j].feature] += 1;
    }
  }
  const sortedIdx = rankRuleFeatures(rules, nFeatures);
  const features = sortedIdx.filter((f) => featureCounts[f] > 0);
  return {features, featureCounts};
}

/**
 * Convert the rules of Rule type to RuleX type (used for presentation only)
 */
function initRuleXs(rules: Rule[], model: RuleList): RuleX[] {
  return rules.map((r, i) => {
    const {conditions, ...rest} = r;
    let conditionXs: ConditionX[] = [];
    // if (i !== rules.length - 1) 
    const conditionsFiltered = conditions.filter((c) => c.feature >= 0);
    conditionXs = conditionsFiltered.map((c) => ({
      ...c,
      ruleIdx: r.idx,
      desc: model.categoryMathDesc(c.feature, c.category),
      title: model.categoryDescription(c.feature, c.category), 
      x: 0, width: 0, height: 0, 
      interval: model.categoryInterval(c.feature, c.category),
      expanded: false, 
      range: model.meta.ranges[c.feature],
      // histRange: model.categoryHistRange(c.feature, c.category),
      isCategorical: model.meta.isCategorical[c.feature]
    }));

    return {
      ...rest, conditions: conditionXs, height: 0, x: 0, y: 0, width: 0, expanded: false,
    };
  });
}

export interface OptionalParams {
  evidenceWidth: number;
  // height: number;
  duration: number;
  fontSize: number;
  minSupport: number;
  headerSize: number;
  headerRotate: number;
  paddingX: number;
  paddingY: number;
  paddingLeft: number;
  flowWidth: number;
  x0: number;
  y0: number;
  // transform: string;
  elemWidth: number;
  elemHeight: number;
  color: ColorType;
  expandFactor: [number, number];
  displayFlow: boolean;
  displayFidelity: boolean;
  displayEvidence: boolean;
  zoomable: Boolean;
  tooltip: Boolean;
}

export interface RuleMatrixParams extends Partial<OptionalParams> {
  model: RuleList;
  support: number[][] | number[][][];
  // dataset?: DataSet;
  streams?: Streams | ConditionalStreams;
  input?: number[] | null;
  // supports: number[][]
  // outputs?: number[];
}

export default class RuleMatrixPainter implements Painter<{}, RuleMatrixParams> {
  public static defaultParams: OptionalParams = {
    minSupport: 0.01,
    color: labelColor,
    elemWidth: 30,
    elemHeight: 30,
    x0: 20,
    y0: 160,
    duration: defaultDuration,
    fontSize: 12,
    headerSize: 13,
    headerRotate: -50,
    paddingX: 0.1,
    paddingY: 0.2,
    paddingLeft: 0.5,
    evidenceWidth: 150,
    expandFactor: [3, 2],
    flowWidth: 50,
    displayFlow: true,
    displayFidelity: true,
    displayEvidence: true,
    zoomable: false,
    tooltip: true
  };
  private selector: d3.Selection<SVGGElement, any, any, any>;
  private params: RuleMatrixParams & OptionalParams;
  private minSupport: number;
  private model: RuleList;
  private support: number[][] | number[][][];
  private rules: RuleX[];
  private xs: number[];
  private ys: number[];
  private widths: number[];
  private heights: number[];
  private features: number[];
  private featureCounts: number[];
  private f2Idx: number[];
  // private highlightRules
  private expandedElements: Set<string>;
  private expandedFeatures: Set<number>;
  private activeFeatures: Set<number>;
  // private onClick: (r: number, f: number) => void;
  private rowPainter: RowPainter;
  private flowPainter: FlowPainter;
  private outputPainter: OutputPainter;
  private headerPainter: HeaderPainter;
  constructor() {
    this.expandedElements = new Set();
    this.activeFeatures = new Set();
    this.rowPainter = new RowPainter();
    this.flowPainter = new FlowPainter();
    this.outputPainter = new OutputPainter();
    this.headerPainter = new HeaderPainter();
    this.collapseAll = this.collapseAll.bind(this);
    this.clickExpand = this.clickExpand.bind(this);
    this.clickFeature = this.clickFeature.bind(this);
    this.clickCondition = this.clickCondition.bind(this);
  }

  feature2Idx(f: number) {
    return this.f2Idx[f];
  }

  public update(params: RuleMatrixParams) {
    this.params = { ...(RuleMatrixPainter.defaultParams), ...(this.params), ...params };
    return this;
  }

  public collapseAll() {
    if (this.expandedElements.size) {
      this.expandedElements.clear();
      this.render(this.selector);
    }
  }

  public clickExpand(r: number) {
    const rules = this.rules;
    const rule = rules[r];
    // Clicking on the button of a group to expand
    if (isRuleGroup(rule)) {
      // console.log(`Expand rule group ${r}`); // tslint:disable-line
      const nested = initRuleXs(rule.rules, this.model);
      nested[0].expanded = true;  // this flag is used for drawing the button
      this.rules = [...rules.slice(0, r), ...nested, ...rules.slice(r + 1)];
    } else {
    // Clicking on the button to collapse
      let i = r + 1;
      const nested = [rule];
      while (i < rules.length && rules[i].parent === rule.parent) {
        nested.push(rules[i]);
        i++;
      }
      // console.log(`Collapse rules [${r}, ${i})`); // tslint:disable-line
      const grouped = initRuleXs([groupRules(nested)], this.model);
      this.rules = [...rules.slice(0, r), ...grouped, ...rules.slice(i)];
    }
    this.render(this.selector);

  }

  public clickCondition(r: number, f: number): void {
    const key = `${r},${f}`;
    // console.log(`clicked ${key}`); // tslint:disable-line
    if (this.expandedElements.has(key)) {
      this.expandedElements.delete(key);
    } else {
      this.expandedElements.add(key);
    }
    this.render(this.selector);
  }

  public clickFeature(f: number): void {
    if (this.activeFeatures.has(f)) {
      this.activeFeatures.delete(f);
      this.clickCondition(-1, f);
    } else {
      this.activeFeatures.add(f);
      this.clickCondition(-1, f);
    }
    // this.render(this.selector);
  }

  public updateRules(): this {
    const {model, minSupport, support} = this.params;
    if (this.model !== model || this.minSupport !== minSupport || this.support !== support) {
      // console.log('Updating Rules'); // tslint:disable-line
      const rules = model.getRules();
      const nFeatures = model.nFeatures;

      // Filter rules by grouping
      const supportSum = nt.sum(rules.map(r => r.totalSupport));
      const groupedRules = groupBySupport(rules, minSupport * supportSum);
      
      this.rules = initRuleXs(groupedRules, model);

      // compute feature Mapping
      const {features, featureCounts} = computeExistingFeatures(this.rules, nFeatures);
      const f2Idx = new Array(nFeatures).fill(-1);
      features.forEach((f: number, i: number) => f2Idx[f] = i);
      this.features = features;
      this.featureCounts = featureCounts;
      this.f2Idx = f2Idx;

    }
    this.support = support;
    this.minSupport = minSupport;
    this.model = model;
    return this;
  }

  public updatePresentation(): this {
    const {expandFactor, elemWidth, elemHeight, paddingX, paddingY, paddingLeft} = this.params;
   
    // compute active sets
    const expandedRules = new Set<number>();
    const expandedFeatures = new Set<number>();
    this.expandedElements.forEach((s: string) => {
      const rf = s.split(',');
      expandedRules.add(Number(rf[0]));
      expandedFeatures.add(Number(rf[1]));
    });

    // compute the widths and heights
    const expandWidth = elemWidth * expandFactor[0];
    const expandHeight = elemHeight * expandFactor[1];
    const groupedHeight = Math.min(elemHeight, Math.max(elemHeight / 2, 10) - 2);
    const padX = paddingX * elemWidth;
    const padY = paddingY * elemHeight;
    const padLeft = paddingLeft * elemWidth;

    const featureWidths = 
      this.features.map((f: number) => (expandedFeatures.has(f) ? expandWidth : elemWidth));
    const ruleHeights = 
      this.rules.map((r: Rule, i: number) => 
        (expandedRules.has(i) ? expandHeight : (isRuleGroup(r) ? groupedHeight : elemHeight))
      );

    let ys = ruleHeights.map((h) => h + padY);
    ys = [0, ...(nt.cumsum(ys.slice(0, -1)))];

    let xs = [padLeft, ...(featureWidths.map((w: number) => w + padX))];
    xs = nt.cumsum(xs.slice(0, -1));

    this.xs = xs;
    this.ys = ys;
    this.widths = featureWidths;
    this.heights = ruleHeights;
    // this.activeRules = activeRules;
    this.expandedFeatures = expandedFeatures;
    return this;
  }

  public updatePos(): this {
    const {streams, input} = this.params;
    const {xs, ys, widths, heights, expandedElements, activeFeatures, model} = this;
    const width = xs[xs.length - 1] + widths[widths.length - 1];
    const lastIdx = input ? model.predict(input) : -1;
    // const support = model.getSupportOrSupportMat();
    // console.log(lastIdx); // tslint:disable-line
    // update ruleX positions
    this.rules.forEach((r, i) => {
      r.y = ys[i]; 
      r.height = heights[i];
      r.width = isRuleGroup(r) ? width - 10 : width; // isRuleGroup(r) ? (width - 10) : width;
      r.x = isRuleGroup(r) ? 10 : 0;
      r.highlight = i === lastIdx;
      // r.support = support[i];
    });

    // update conditionX positions
    this.rules.forEach((r, i) => {
      r.conditions.forEach((c) => {
        if (c.feature !== -1) {
          c.x = xs[this.feature2Idx(c.feature)];
          c.width = widths[this.feature2Idx(c.feature)];
          c.height = heights[i];
          c.expanded = expandedElements.has(`${i},${c.feature}`);
          c.active = activeFeatures.has(c.feature); 
          c.value = (i <= lastIdx && input) ? input[c.feature] : undefined;
        }
        if (streams) {
          if (isConditionalStreams(streams)) c.stream = streams[i][c.feature];
          else c.stream = streams[c.feature];
        }
      });
    });
    return this;
  }

  public render(selector: d3.Selection<SVGGElement, any, any, any>) {
    const {x0, y0} = this.params;
    this.selector = selector;
    this.updateRules().updatePresentation().updatePos();

    // Global Transform
    selector.attr('transform', `translate(${x0}, ${y0})`);
    // selector.selectAll('rect.bg').data(['rect-bg']).enter()
    //   .append('rect').attr('class', 'bg');
    
    // Root Container
    selector.selectAll('g.container').data(['container']).enter()
      .append('g').attr('class', 'container');
    const container = selector.select<SVGGElement>('g.container');

    // Rule Root
    container.selectAll('g.rules').data(['rules']).enter()
      .append('g').attr('class', 'rules');
    const ruleRoot = container.select<SVGGElement>('g.rules');

    // Flow Root
    container.selectAll('g.flows').data(['flows']).enter()
    .append('g').attr('class', 'flows');
    const flowRoot = container.select<SVGGElement>('g.flows');

    // Header Root
    container.selectAll('g.headers').data(['headers']).enter()
      .append('g').attr('class', 'headers');
    const headerRoot = container.select<SVGGElement>('g.headers');

    // Output
    container.selectAll('g.outputs').data(['outputs']).enter()
      .append('g').attr('class', 'outputs');
    const outputRoot = container.select<SVGGElement>('g.outputs');

    // CursorFollow
    container.selectAll('g.cursor-follow').data(['cursor-follow']).enter()
      .append('g').attr('class', 'cursor-follow');
    const cursorFollow = container.select<SVGGElement>('g.cursor-follow');
   
    // Render cursorFollow first, because the we need to register tooltip to rowPainter
    this.renderCursorFollow(container, cursorFollow);
    this.renderRows(ruleRoot);
    this.renderFlows(flowRoot);
    this.renderHeader(headerRoot);
    this.renderOutputs(outputRoot);

    // Button
    selector.selectAll('g.buttons').data(['buttons']).enter()
      .append('g').attr('class', 'buttons');
    const buttons = selector.select<SVGGElement>('g.buttons');
    this.renderButton(buttons);

    this.registerZoom(selector, container);

    // selector.select('rect.bg')
    //   .attr('width', this.getWidth() + 400)
    //   .attr('height', this.getHeight() + 400)
    //   .attr('fill', 'white')
    //   .attr('fill-opacity', 1e-6);

    return this;
  }

  public renderRows(
    root: d3.Selection<SVGGElement, any, any, any>,
    // tooltip: d3.Selection<SVGGElement, any, any, any>
  ): this {
    const { duration, flowWidth, color } = this.params;
    const {rules} = this;
    const collapseYs = new Map<string, number>();
    rules.forEach((r) => isRuleGroup(r) && r.rules.forEach((_r) => collapseYs.set(`r-${_r.idx}`, r.y)));

    // const flatRules = flattenRules(rules);
    root.attr('transform', `translate(${flowWidth * 2 + 10},0)`);
    // Joined
    const rule = root
      .selectAll<SVGGElement, {}>('g.matrix-rule')
      .data<RuleX>(this.rules, function (r: RuleX) { return r ? `r-${r.idx}` : this.id; });

    // Enter
    const ruleEnter = rule.enter().append<SVGGElement>('g').attr('id', d => `r-${d.idx}`)
      .attr('class', 'matrix-rule')
      .attr('transform', (d: RuleX) => d.parent ? `translate(${d.x},${d.y - 40})` : 'translate(0,0)');

    // Update
    const ruleUpdate = ruleEnter.merge(rule)
      .attr('display', null).classed('hidden', false).classed('visible', true);
    ruleUpdate
      .transition()
      .duration(duration)
      .attr('transform', (d: RuleX) => `translate(${d.x},${d.y})`);
    
    // Exit
    rule.exit()
      .classed('visible', false)
      .classed('hidden', true)
      .transition()
      .duration(duration)
      .attr('transform', (d, i, nodes) => 
        `translate(0,${collapseYs.get(nodes[i].id)})`
      ).transition().delay(300)
      .attr('display', 'none');
    
    const painter = this.rowPainter;

    ruleUpdate.each((d: RuleX, i: number, nodes) => {
      // if (i === this.rules.length - 1) return;
      painter.data(d)
        .update({
          labelColor: color,
          // feature2Idx: this.feature2Idx, 
          onClick: (f) => this.clickCondition(i, f),
          onClickButton: () => this.clickExpand(i),
        })
        .render(d3.select(nodes[i]));
    });

    return this;
  }

  public renderOutputs(root: d3.Selection<SVGGElement, any, SVGElement, any>): this {
    const { evidenceWidth, duration, color, flowWidth, elemHeight, displayEvidence, displayFidelity } = this.params;
    const widthFactor = evidenceWidth / this.model.maxSupport;
    const width = this.getWidth();
    root.transition().duration(duration)
      .attr('transform', `translate(${width + flowWidth * 2 + 10},0)`);

    this.outputPainter.update({widthFactor, duration, color, elemHeight, displayEvidence, displayFidelity})
      .data(this.rules).render(root);
    return this;
  }

  public renderFlows(root: d3.Selection<SVGGElement, any, any, any>): this {
    const {flowWidth, color, displayFlow} = this.params;
    if (!displayFlow) {
      root.remove();
      return this;
    }
    const { rules } = this;
    const dx = flowWidth + 10; // Math.max(50, flowWidth + 10);
    
    const flows = rules.map(({_support, y, height}) => ({
        support: _support, y: y + height / 2
      }));

    this.flowPainter.update({dx, dy: flowWidth, width: flowWidth, color})
      .data(flows).render(root);
    return this;
  }

  public renderHeader(root: d3.Selection<SVGGElement, any, any, any>): this {
    const {duration, headerSize, headerRotate, flowWidth} = this.params;
    const {xs, widths, features, expandedFeatures, featureCounts, model} = this;

    root.attr('transform', `translate(${flowWidth * 2 + 10},0)`);
    const featureData: Feature[] = features.map((f: number, i: number) => ({
      text: model.meta.featureNames[f],
      x: xs[i],
      width: widths[i],
      count: featureCounts[f],
      cutPoints: model.discretizers[f].cutPoints,
      range: model.meta.ranges[f],
      categories: model.meta.categories[f],
      expanded: expandedFeatures.has(f),
      feature: f
    }));

    this.headerPainter.data(featureData)
      .update({duration, rotate: headerRotate, headerSize, onClick: this.clickFeature})
      .render(root);
    
    return this;
  }

  public renderCursorFollow(
    root: d3.Selection<SVGGElement, any, any, any>,
    cursorFollow: d3.Selection<SVGGElement, any, any, any>,
  ): this {
    cursorFollow.attr('display', 'none');
    const tooltip = this.renderToolTip(cursorFollow);
    const ruler = this.renderLine(cursorFollow);
    const height = this.getHeight();
    const width = this.getWidth();
    const {flowWidth} = this.params;
    root
      .on('mousemove', function() {
        const pos = d3.mouse(this);
        cursorFollow.attr('transform', `translate(${pos[0]},0)`);
        tooltip.attr('transform', `translate(4,${pos[1] - 6})`);
        if (pos[0] < flowWidth || pos[0] > flowWidth + width) {
          ruler.attr('display', 'none');
        } else {
          ruler.select('line').attr('y2', height);
          ruler.attr('display', null);
        }
      })
      .on('mouseover', () => cursorFollow.attr('display', null))
      .on('mouseout', () => cursorFollow.attr('display', 'none'));
    this.rowPainter.update({tooltip});
    return this;
  }
  
  private renderToolTip(cursorFollow: d3.Selection<SVGGElement, any, any, any>) {
    const tooltipEnter = cursorFollow.selectAll('g.tooltip')
      .data(['tooltip']).enter()
      .append<SVGGElement>('g').attr('class', 'tooltip')
      .attr('transform', `translate(4,-6)`);

    tooltipEnter.append('rect').attr('class', 'tooltip');
      // .attr('stroke', '#444').attr('stroke-opacity', 0.4);
    tooltipEnter.append('text').attr('class', 'tooltip')
      .attr('text-anchor', 'start').attr('dx', 5).attr('dy', -2);
    const tooltip = cursorFollow.select<SVGGElement>('g.tooltip');
    return tooltip;
  }

  private renderLine(cursorFollow: d3.Selection<SVGGElement, any, any, any>) {
    // root.
    const ruler = cursorFollow.selectAll('g.cursor-ruler').data(['g'])
      .enter().append('g').attr('class', 'cursor-ruler');
    ruler.append('line').attr('x1', -2).attr('x2', -2).attr('y1', 0).attr('y2', 100);
    // root.on('mouseover.line', () => cursorFollow.attr('display', null));
    // root.on('mouseout.line', )
    return cursorFollow.select('g.cursor-ruler');
    // return this;
  }

  private renderButton(buttonGroup: d3.Selection<SVGGElement, any, any, any>): this {
    buttonGroup.attr('transform', `translate(0,-150)`);
    const g = buttonGroup.selectAll('g.reset-button').data(['g']).enter()
      .append('g').attr('class', 'reset-button')
      .on('click', this.collapseAll);
    const rect = g.append('rect').attr('rx', 3).attr('ry', 3)
      .attr('stroke', '#888').attr('fill', 'white');
    const text = g.append<SVGTextElement>('text')
      .attr('text-anchor', 'start').text('Collapse All')
      .attr('fill', '#444')
      .attr('y', 17).attr('dx', 5);
    const node = text.node();
    const box = node ? node.getBBox() : null;
    rect.attr('width', box ? box.width + 10 : 40)
      .attr('height', box ? box.height + 8 : 20);
    return this;
  }

  private registerZoom(
    root: d3.Selection<SVGGElement, any, any, any>,
    container: d3.Selection<SVGGElement, any, any, any>
  ): this {
    const {zoomable} = this.params;
    if (!zoomable) {
      root.on('zoom', null);
      return this;
    }
    // const {x0, y0} = this.params;
    const rootNode = container.node();
    const zoomed = function () {
      if (rootNode) {
        container.attr('transform', d3.event.transform);
      }
    };
    // console.log(width); // tslint:disable-line
    // console.log(height); // tslint:disable-line
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      // .translateExtent([[-2000, -2000], [2000, 2000]])
      .on('zoom', zoomed);
    root.call(zoom);
    return this;
  }

  private getHeight() {
    const lastRule = this.rules[this.rules.length - 1];
    return lastRule.y + lastRule.height;
  }

  private getWidth() {
    const {xs, widths} = this;
    return xs[xs.length - 1] + widths[widths.length - 1];
  }

}
