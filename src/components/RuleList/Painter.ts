import * as d3 from 'd3';
import * as nt from '../../service/num';

import { Condition, Rule, DataSet, Histogram } from '../../models';
import { Painter, defaultDuration, ColorType, labelColor, HistPainter } from '../Painters';
// import * as utils from '../../service/utils';
import { RuleList } from '../../models/ruleModel';

const defaultCondWidth = 200;
const histHeight = 60;

interface ConditionX extends Condition {
  tspan: string;
  title: string;
  // interval: [number | null, number | null];
  histRange: [number, number];
  activeRatio: [number, number];
  collapsed?: boolean;
  histPainter?: HistPainter;
}

interface RuleX extends Rule {
  x: number;
  y: number;
  height: number;
  // support: number[];
  // _support: number[];
  collapsed?: boolean;
}

interface ConditionOptional {
  width: number;
  interval: number;
  duration: number;
  fontSize: number;
}

interface ConditionPainterParams extends Partial<ConditionOptional> {
  hists?: (feature: number) => Histogram[];
  // featureName: (i: number) => string;
  // categoryInterval: (i: number) => number | [number | null, number | null];
}

type ConditionDataType = d3.ValueFn<SVGElement, RuleX, ConditionX[]>;

class ConditionPainter implements Painter<ConditionDataType, ConditionPainterParams> {
  public static defaultParams: ConditionOptional = {
    width: defaultCondWidth,
    duration: defaultDuration,
    fontSize: 12,
    interval: 20
  };
  private params: ConditionPainterParams & ConditionOptional;
  private conditions: ConditionDataType;
  private histPainter: HistPainter;
  constructor() {
    this.histPainter = new HistPainter();
  }
  public update(params: Partial<ConditionPainterParams>) {
    this.params = { ...ConditionPainter.defaultParams, ...this.params, ...params };
    return this;
  }
  public data(conditions: ConditionDataType) {
    this.conditions = conditions;
    return this;
  }
  public render(selector: d3.Selection<SVGElement, any, any, any>) {
    const condition = this.doJoin(selector);
    const conditionEnter = this.doEnter(condition.enter());
    this.doUpdate(conditionEnter.merge(condition));
    this.doExit(condition.exit());
    return this;
  }

  public doJoin(
    selector: d3.Selection<SVGElement, any, SVGElement, any>
  ): d3.Selection<SVGGElement, ConditionX, SVGElement, any> {
    const joined = selector.selectAll<SVGGElement, ConditionX>('g.condition').data(this.conditions);
    return joined;
  }

  public doEnter(
    selector: d3.Selection<d3.EnterElement, ConditionX, SVGElement, any>
  ): d3.Selection<SVGGElement, ConditionX, SVGElement, any> {
    const { width, fontSize } = this.params;
    const joined = selector.append<SVGGElement>('g').attr('class', 'condition');
    joined
      .append('rect')
      .attr('class', 'bg-rect')
      .attr('width', width)
      .attr('height', fontSize * 1.5);
    joined
      .append('rect')
      .attr('class', 'range-rect')
      .attr('height', fontSize * 1.5);
    const text = joined.append('text').attr('text-anchor', 'middle');
    // .style('fill-opacity', 1e-6);
    text.append('tspan');
    text.append('title');

    joined.append('g').attr('class', 'hists');
    return joined;
  }

  public doUpdate(conditionUpdate: d3.Selection<SVGGElement, ConditionX, SVGElement, any>) {
    const { width, duration, interval, hists, fontSize } = this.params;

    const updated = conditionUpdate
      .transition()
      .duration(duration)
      .attr('transform', (c: ConditionX, i: number) => `translate(${i * (width + interval)},5)`);

    updated
      .select('rect.bg-rect')
      // .transition().duration(duration)
      .attr('width', width)
      .attr('rx', 3)
      .attr('ry', 3);
    updated
      .select('rect.range-rect')
      // .transition().duration(duration)
      .attr('width', (c: ConditionX) => (c.activeRatio[1] - c.activeRatio[0]) * width)
      .attr('x', (c: ConditionX) => c.activeRatio[0] * width)
      .attr('rx', 3)
      .attr('ry', 3);
    const text = updated
      .select('text')
      .style('font-size', fontSize)
      .attr('x', width / 2)
      .attr('y', fontSize * 1.2);
    text.select('tspan').text((c: ConditionX) => c.tspan);
    text.select('title').text((c: ConditionX) => c.title);

    const histGroup = conditionUpdate.select<SVGGElement>('g.hists').attr('transform', `translate(0, ${fontSize * 2})`);

    const painter = this.histPainter;
    histGroup.each((c: ConditionX, i: number, nodes) => {
      // console.log(c); // tslint:disable-line
      // if (c.collapsed) return;
      // console.warn(i);
      painter
        .data((hists && !c.collapsed) ? hists(c.feature) : [])
        .update({width, height: histHeight - 5, interval: c.histRange})
        .render(d3.select(nodes[i]));
    });

  }

  public doExit(conditionExit: d3.Selection<Element, ConditionX, any, any>): void {
    const { duration } = this.params;
    conditionExit
      .transition()
      .duration(duration)
      .style('fill-opacity', 1e-6)
      .remove();
  }
}

interface OutputOptional {
  // width: number;
  // interval: number;
  height: number;
  duration: number;
  fontSize: number;
  color: ColorType;
}

interface OutputPainterParams extends Partial<OutputOptional> {
  // unitWidth: number;
  // scale: number;
}

type OutputDataType = d3.ValueFn<SVGElement, RuleX, OutputData[]>;

type OutputData = { x: number; width: number; y: number };

class OutputPainter implements Painter<OutputDataType, OutputPainterParams> {
  public static defaultParams: OutputOptional = {
    // width: defaultCondWidth,
    height: 30,
    duration: defaultDuration,
    fontSize: 12,
    color: labelColor
    // interval: 20,
  };
  private params: OutputPainterParams & OutputOptional;
  private output: OutputDataType;
  public update(params: Partial<OutputPainterParams>) {
    this.params = { ...OutputPainter.defaultParams, ...this.params, ...params };
    return this;
  }
  public data(output: OutputDataType) {
    this.output = output;
    return this;
  }
  public render(selector: d3.Selection<SVGElement, any, any, any>) {
    const condition = this.doJoin(selector);
    const conditionEnter = this.doEnter(condition.enter());
    this.doUpdate(conditionEnter.merge(condition));
    this.doExit(condition.exit());
    return this;
  }

  public doJoin(
    selector: d3.Selection<SVGElement, RuleX, SVGElement, any>
  ): d3.Selection<SVGRectElement, OutputData, SVGElement, RuleX> {
    selector
      .selectAll('g.outputs')
      .data(['group'])
      .enter()
      .append('g')
      .attr('class', 'outputs');
    return selector
      .select<SVGGElement>('g.outputs')
      .selectAll<SVGRectElement, OutputData>('rect.output')
      .data(this.output);
  }

  public doEnter(
    selector: d3.Selection<d3.EnterElement, OutputData, SVGElement, RuleX>
  ): d3.Selection<SVGRectElement, OutputData, SVGElement, RuleX> {
    const { height, color } = this.params;
    const joined = selector
      .append<SVGRectElement>('rect')
      .attr('class', 'output')
      // .attr('class', 'bg-rect')
      .attr('x', (d: OutputData) => d.x)
      .attr('y', (d: OutputData) => d.y)
      .attr('width', 1e-6)
      .attr('height', height)
      .style('fill', (d: OutputData, i: number) => color(i));

    return joined;
  }

  public doUpdate(outputUpdate: d3.Selection<SVGRectElement, OutputData, SVGElement, RuleX>) {
    const { duration } = this.params;

    // const updated =
    outputUpdate
      .transition()
      .duration(duration)
      .attr('x', (d: OutputData) => d.x)
      .attr('width', (d: OutputData) => d.width);
  }

  public doExit(outputExit: d3.Selection<Element, OutputData, any, any>): void {
    const { duration } = this.params;
    outputExit
      .transition()
      .duration(duration)
      .style('fill-opacity', 1e-6)
      .remove();
  }
}

interface FlowOptional {
  width: number;
  dx: number;
  dy: number;
  height: number;
  duration: number;
  color: ColorType;
}

interface FlowPainterParams extends Partial<FlowOptional> {}

type FlowData = { width: number; shift: number; height: number; y: number };

class FlowPainter implements Painter<RuleX[], FlowPainterParams> {
  public static defaultParams: FlowOptional = {
    width: 100,
    height: 50,
    duration: defaultDuration,
    dy: -30,
    dx: -40,
    color: labelColor
    // fontSize: 12,
    // multiplier: 1.0,
  };
  private params: FlowPainterParams & FlowOptional;
  private rules: RuleX[];
  // private totalFlows: number[];
  private flows: number[];
  private reserves: Float32Array[];
  private reserveSums: Float32Array;

  public update(params: FlowPainterParams) {
    this.params = { ...FlowPainter.defaultParams, ...this.params, ...params };
    return this;
  }
  public data(rules: RuleX[]) {
    this.rules = rules;
    this.flows = rules.map((r: RuleX) => nt.sum(r._support));

    let reserves: Float32Array[] = 
      rules[0]._support.map((_, i) => new Float32Array(rules.map(rule => rule._support[i])));
    this.reserves = reserves.map((reserve: Float32Array) => nt.cumsum(reserve.reverse()).reverse());
    this.reserveSums = new Float32Array(this.reserves[0].length);
    this.reserves.forEach((reserve: Float32Array) => nt.add(this.reserveSums, reserve, false));
    // console.log(this.reserves); // tslint:disable-line
    // console.log(this.reserveSums); // tslint:disable-line
    return this;
  }
  public render(selector: d3.Selection<SVGElement, any, any, any>) {
    const rule = this.doJoin(selector);
    const ruleEnter = this.doEnter(rule.enter());
    this.doUpdate(ruleEnter.merge(rule));
    this.doExit(rule.exit());
    return this;
  }

  public doJoin(selector: d3.Selection<SVGElement, any, SVGElement, any>) {
    selector
      .selectAll('g.flows')
      .data(['flows'])
      .enter()
      .append('g')
      .attr('class', 'flows');
    return selector
      .select('g.flows')
      .selectAll<SVGGElement, RuleX>('g.flow')
      .data(this.rules);
  }

  public getReserveJoin(selector: d3.Selection<SVGElement, any, any, any>) {
    const { width, dy } = this.params;
    const { reserves, reserveSums, rules, flows } = this;
    const multiplier = width / reserveSums[0];
    return selector.selectAll('path.reserve').data((rule: RuleX, i: number): FlowData[] => {
      let shift = 0;
      const height =
        (i > 0
          ? rule.y - rules[i - 1].y + 0.5 * (rule.height - rules[i - 1].height - multiplier * (flows[i] + flows[i - 1]))
          : -dy) - 3.5;
      // const sum = reserveSums[i] * multiplier;
      const y = (rule.height - flows[i] * multiplier) / 2 - height; // + reserveSums[i] * multiplier;
      return rule._support.map((_, j: number) => {
        const reserve = reserves[j][i] * multiplier;
        const ret = {
          height,
          width: reserve,
          shift,
          y
        };
        shift += reserve;
        return ret;
      });
    });
  }

  public getFlowJoin(selector: d3.Selection<SVGElement, any, any, any>) {
    const { width } = this.params;
    const { reserveSums, flows } = this;
    const multiplier = width / reserveSums[0];

    return selector.selectAll('path.flow').data((d: RuleX, i: number): FlowData[] => {
      let shift = ((i === 0 ? 0 : reserveSums[i] - reserveSums[0]) - flows[i]) * multiplier + 2;
      const sum = d.totalSupport * multiplier;
      let y = (d.height - sum) / 2 + 2;
      // y = y > 0 ? y : 0;
      return d._support.map((support: number, j: number) => {
        const value = support * multiplier;
        const ret = {
          width: value,
          shift,
          height: value,
          y
        };
        y += value;
        shift += value;
        return ret;
      });
    });
  }

  public doEnter(flowEnter: d3.Selection<d3.EnterElement, any, any, any>): d3.Selection<SVGElement, any, any, any> {
    // const { width } = this.params;
    // const {totalFlows, reserves, reserveSums} = this;
    // const multiplier = width / totalFlows[0];
    const flowEntered = flowEnter.append<SVGGElement>('g').attr('class', 'flow');

    return flowEntered;
  }

  public doUpdate(flowUpdate: d3.Selection<SVGElement, RuleX, any, any>) {
    const { width, duration, dx, color } = this.params;
    // const { rules } = this;
    // const updateTransition =
    flowUpdate
      .transition()
      .duration(duration)
      .attr('transform', (r: RuleX) => `translate(${width},${r.y})`);

    // add the rectangles
    const reserve = this.getReserveJoin(flowUpdate);
    const reserveUpdate = reserve
      .enter()
      .append('path')
      .attr('class', 'reserve')
      .style('fill', (d, i) => color(i))
      .merge(reserve);
    reserveUpdate
      .transition()
      .duration(duration)
      .attr('d', (d: FlowData) => {
        return `M ${d.shift - width},${d.y} 
        l ${d.width},${0} v ${d.height} l ${-d.width},${0} z`;
        // return `M ${d.shift - width},${d.y - d.shift} 
        // l ${d.width},${-d.width} v ${d.height} l ${-d.width},${d.width} z`;
      });
    // .attr('width', (d: FlowData) => d.width)
    // .attr('height', (d: FlowData) => d.height)
    // .attr('x', (d: FlowData) => d.shift - width)
    // .attr('y', (d: FlowData) => -d.height);

    const outFlow = this.getFlowJoin(flowUpdate);
    const outFlowUpdate = outFlow
      .enter()
      .append('path')
      .attr('class', 'flow')
      .style('fill', (d, i) => color(i))
      .merge(outFlow);
    outFlowUpdate
      .transition()
      .duration(duration)
      .attr('d', (d: FlowData) => {
        // const s = {x: d.shift, y: 0};
        return `M ${d.shift} ${d.y} H ${-dx - 3} v ${d.height} H ${d.shift + d.width} z`;
        // const t = {x: -dx, y: d.height};
        // return `M ${d.shift} ${d.y} H ${-dx - 3} v ${-d.width} H ${d.shift + d.width} z`;
      });
  }

  public doExit(flowExit: d3.Selection<SVGElement, ConditionX, any, any>): void {
    const { duration } = this.params;
    flowExit
      .transition()
      .duration(duration)
      .style('fill-opacity', 1e-6)
      .remove();

    const reserve = this.getReserveJoin(flowExit);
    reserve
      .exit()
      .transition()
      .duration(duration)
      .attr('d', '')
      .remove();
    const outFlow = this.getFlowJoin(flowExit);
    outFlow
      .exit()
      .transition()
      .duration(duration)
      .attr('d', '')
      .remove();
  }
}

interface RuleOptional {
  duration: number;
  fontSize: number;
  interval: number;
  buttonSize: number;
  conditionWidth: number;
  outputWidth: number;
  color: ColorType;
  onClick: (i: number, collapse: boolean) => void;
  categoryDescription: (f: number, c: number, abr: boolean) => string;
}

interface RulePainterParams extends Partial<RuleOptional> {
  // featureName: (i: number) => string;
  categoryRange?: (f: number, c: number) => [number, number];
  categoryRatio?: (f: number, c: number) => [number, number];
  hists?: (f: number) => Histogram[];
}

class RulePainter implements Painter<RuleX[], RulePainterParams> {
  public static defaultParams: RuleOptional = {
    // width: 200,
    // height: 50,
    color: labelColor,
    conditionWidth: defaultCondWidth,
    duration: defaultDuration,
    fontSize: 12,
    interval: 30,
    buttonSize: 12,
    outputWidth: 150,
    onClick: () => null,
    categoryDescription: (f: number, c: number, abr: boolean) => `X${f} = ${c}`
    // interval: 20,
  };
  private params: RulePainterParams & RuleOptional;
  private rules: RuleX[];
  private conditions: ConditionX[][];
  private conditionPainter: ConditionPainter;
  private outputPainter: OutputPainter;
  // private selector: d3.Selection<SVGElement, any, any, any>;
  constructor() {
    this.conditionPainter = new ConditionPainter();
    this.outputPainter = new OutputPainter();
    // this.onClick = this.onClick.bind(this);
  }
  public onClick(i: number, collapsed: boolean) {
    if (this.params.hists) 
      this.params.onClick(i, collapsed);
    // this.render(this.selector);
    console.log('clicked!'); // tslint:disable-line
  }
  public update(params: RulePainterParams) {
    this.params = { ...RulePainter.defaultParams, ...this.params, ...params };
    return this;
  }
  public data(rules: RuleX[]) {
    this.rules = rules;
    this.conditions = rules.map((r: RuleX, i: number) => {
      if (i === this.rules.length - 1) return [];
      const collapsed = r.collapsed;
      return r.conditions.map((c: Condition) => {
        return { ...c, tspan: '', title: '', collapsed, 
          activeRatio: [0, 1] as [number, number], 
          // interval: [null, null] as [number | null, number | null],
          histRange: [0, 0] as [number, number],
        };
      });
    });
    this.conditionPainter.data((r: RuleX, i: number) => {
      if (i === this.rules.length - 1) return [];
      return this.conditions[i];
    });
    return this;
  }
  public updatePos() {
    const { categoryRange, categoryRatio, categoryDescription} = this.params;
    this.rules.forEach((r: RuleX, i: number) => {
      if (i === this.rules.length - 1) return;
      const collapsed = r.collapsed;
      this.conditions[i].forEach((c: ConditionX, j: number) => {
        const range = categoryRange ? categoryRange(c.feature, c.category) : c.category;
        c.tspan = categoryDescription(c.feature, c.category, true);
        c.title = categoryDescription(c.feature, c.category, false);
        c.collapsed = collapsed;
        c.histRange = Array.isArray(range) ? range : [range, range + 1];
        c.activeRatio = categoryRatio ? categoryRatio(c.feature, c.category) : [0, 0];
      });
    });
  }
  public render(selector: d3.Selection<SVGElement, any, any, any>) {
    // this.selector = selector;
    const {interval, outputWidth, color, conditionWidth, hists} = this.params;
    const rule = this.doJoin(selector);
    const ruleEnter = this.doEnter(rule.enter());
    const ruleUpdate = ruleEnter.merge(rule);
    this.doUpdate(ruleUpdate);
    this.doExit(rule.exit());
    this.updatePos();
    this.conditionPainter
      .update({ interval, hists, width: conditionWidth })
      .render(ruleUpdate);
    const maxSupport = Math.max(...this.rules.map(r => r.totalSupport));
    const outputHeight = 20;
    this.outputPainter
      .data((r: RuleX, i: number): OutputData[] => {
        // if (i === this.rules.length - 1) return [];
        let x = (conditionWidth + interval) * r.conditions.length - 40;
        const multiplier = outputWidth / maxSupport;
        const y = (r.height - outputHeight) / 2;
        return r._support.map((o: number): OutputData => {
          const width = o * multiplier;
          const ret = {
            x,
            width,
            y
          };
          x += width + 1;
          return ret;
        });
      })
      .update({ color, height: outputHeight })
      .render(ruleUpdate);
    return this;
  }

  public doJoin(selector: d3.Selection<SVGElement, any, any, any>): d3.Selection<SVGElement, any, any, any> {
    selector
      .selectAll('g.rules')
      .data(['flows'])
      .enter()
      .append('g')
      .attr('class', 'rules');
    const joined = selector
      .select('g.rules')
      .selectAll<SVGGElement, RuleX>('g.rule')
      .data(this.rules);
    return joined;
  }

  public doEnter(ruleEnter: d3.Selection<d3.EnterElement, any, any, any>): d3.Selection<SVGElement, any, any, any> {
    const joined = ruleEnter.append<SVGGElement>('g').attr('class', 'rule');
    joined
      .append('rect')
      .attr('class', 'rule')
      .attr('height', (d: RuleX) => d.height)
      .style('fill', '#fff');
    joined
      .selectAll('text.logic')
      .data((d: RuleX) => d.conditions.slice(1))
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'logic')
      .text('AND');
    joined
      .append('text')
      .attr('class', 'collapse-control')
      .attr('text-anchor', 'middle')
      .on('click', (d: RuleX, i) => this.onClick(i, !d.collapsed));
    return joined;
  }

  public doUpdate(ruleUpdate: d3.Selection<SVGElement, any, any, any>) {
    const { duration, conditionWidth, interval, fontSize, buttonSize } = this.params;
    const delta = conditionWidth + interval;
    const updated = ruleUpdate
      .transition()
      .duration(duration)
      .attr('transform', (d: RuleX) => `translate(${d.x + buttonSize * 2}, ${d.y})`);

    updated
      .select('rect.rule')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('x', -buttonSize * 2)
      .attr('height', (d: RuleX) => d.height)
      .attr('width', (d: RuleX) => d.conditions.length * delta - interval + 30);

    ruleUpdate
      .selectAll('text.logic')
      .data((d: RuleX) => d.conditions.slice(1))
      .attr('x', (d: Condition, i: number) => (i + 1) * delta - interval / 2)
      .attr('y', fontSize * 1.5);

    ruleUpdate
      .select('text.collapse-control')
      .attr('x', -buttonSize)
      .attr('y', fontSize * 1.5)
      .text((d: RuleX) => (d.collapsed ? '+' : 'x'));

    // ruleUpdate.each((d: RuleX) => {
    //   if (d.collapsed) return;

    // });
  }

  public doExit(ruleExit: d3.Selection<SVGElement, any, any, any>) {
    const { duration } = this.params;

    ruleExit
      .transition()
      .duration(duration)
      .attr('transform', `translate(-500, 0)`)
      .attr('fill-opacity', 1e-6)
      .remove();
  }
}

// RuleListPainter

interface RuleListOptional {
  fontSize: number;
  width: number;
  transform: string;
  intervalX: number;
  intervalY: number;
  flowWidth: number;
  flow2Rule: number;
}

export interface RuleListPainterParams extends Partial<RuleListOptional> {
  // model: RuleModel;
  data?: DataSet[];
  // selectFeature({idx, deselect}: {idx: number, deselect: boolean}): Action;
  // featureStatus(idx: number): FeatureStatus;
}

export class RuleListPainter implements Painter<RuleList, RuleListPainterParams> {
  public static defaultParams: RuleListOptional = {
    fontSize: 12,
    width: 700,
    transform: '',
    intervalX: 50,
    intervalY: 20,
    flowWidth: 40,
    flow2Rule: 60
  };
  private params: RuleListPainterParams & RuleListOptional;
  private model: RuleList;
  private rules: RuleX[];
  // private supports: number[][];
  private rulePainter: RulePainter;
  private flowPainter: FlowPainter;
  private ruleHeightCollapsed: number;
  private ruleHeightExpanded: number;
  constructor() {
    this.rulePainter = new RulePainter();
    this.flowPainter = new FlowPainter();
    this.update({});
  }
  public update(params: RuleListPainterParams) {
    this.params = { ...RuleListPainter.defaultParams, ...this.params, ...params };
    this.ruleHeightCollapsed = this.params.fontSize * 1.5 + 10;
    this.ruleHeightExpanded = this.ruleHeightCollapsed + histHeight;
    return this;
  }
  public data(model: RuleList) {
    if (model === this.model) {
      // this.rules.forEach((rule: RuleX, i: number): void => {
      //   rule.support = model.supports[i];
      //   rule.totalSupport = nt.sum(model.supports[i]);
      // });
      this.rulePainter.data(this.rules);
      this.flowPainter.data(this.rules);
      return this;
    }
    console.log('Changing the model data'); // tslint:disable-line
    this.model = model;
    this.rules = model.rules.map((rule: Rule, i: number): RuleX => ({
      ...rule,
      // support: model.supports[i],
      // totalSupport: nt.sum(model.supports[i]),
      // _support: nt.isMat(rule.support) ? rule.support.map((s) => nt.sum(s)) : rule.support,
      x: 0, y: 0, height: 0, collapsed: true
    }));
    this.rulePainter.data(this.rules);
    this.flowPainter.data(this.rules);
    return this;
  }
  public render(selector: d3.Selection<SVGElement, any, any, any>) {
    this.reRender(selector);
    return this;
  }

  public updateRulePos() {
    const { ruleHeightCollapsed, ruleHeightExpanded } = this;
    const { intervalY, flowWidth, flow2Rule } = this.params;
    let y = intervalY;
    this.rules.forEach((r: RuleX, i: number) => {
      r.y = y;
      r.x = flowWidth + flow2Rule;
      r.height = r.collapsed ? ruleHeightCollapsed : ruleHeightExpanded;
      y += r.height + intervalY;
    });
  }

  public reRender(selector: d3.Selection<SVGElement, any, any, any>) {
    const { data, intervalX, flowWidth, flow2Rule } = this.params;
    const { rules, model } = this;
    this.updateRulePos();
    // let featureName = (i: number): string => `X${i}`;
    let hists: undefined | ((f: number) => Histogram[]) = undefined;
    // let categoryInterval = undefined;
    let categoryRange = model.categoryHistRange;
    let categoryRatio = undefined;
    let categoryDescription = model.categoryDescription;
    // let labelNames = ((i: number): string => `L${i}`);
    if (data && data.length) {
      // featureName = (i: number): string => data[0].featureNames[i];
      hists = (f: number): Histogram[] => data.map((d) => d.hists[f]);
  
      categoryRatio = (feature: number, cat: number): [number, number] => {
        // console.log(feature); // tslint:disable-line
        if (feature === -1) return [0, 1];
        const ratios = data[0].ratios[feature];
        let prevSum = nt.sum(ratios.slice(0, cat));
        let ratioCat = ratios[cat] === undefined ? 0 : ratios[cat];
        // console.log(prevSum, prevSum + ratios[cat]); // tslint:disable-line
        return [prevSum, prevSum + ratioCat];
      };
      // labelNames = ((i: number): string => data[0].labelNames[i]);
    }
    
    const collapseRule = (i: number, collapsed: boolean): void => {
      rules[i].collapsed = collapsed;
      this.reRender(selector);
    };
    const ruleParams = { hists, categoryRatio, categoryRange,
      interval: intervalX, onClick: collapseRule, categoryDescription };
    this.rulePainter
      .update(ruleParams)
      .render(selector);
    this.flowPainter
      .update({ width: flowWidth, dx: -flow2Rule })
      .render(selector);
  }
}
