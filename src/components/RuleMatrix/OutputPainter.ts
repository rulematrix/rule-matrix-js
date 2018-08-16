import * as d3 from 'd3';
import * as nt from '../../service/num';
import { Painter, ColorType, labelColor, defaultDuration } from '../Painters';
import { RuleX } from './models';
// import { registerStripePattern } from '../../service/utils';
import { isRuleGroup } from '../../models/ruleModel';

// Returns a tween for a transition’s "d" attribute, transitioning any selected
// arcs from their current angle to the specified new angle.
function arcTween(startAngle: number, newAngle: number, arc: d3.Arc<any, any>): (t: number) => string {

  // The function passed to attrTween is invoked for each selected element when
  // the transition starts, and for each element returns the interpolator to use
  // over the course of transition. This function is thus responsible for
  // determining the starting angle of the transition (which is pulled from the
  // element’s bound datum, d.endAngle), and the ending angle (simply the
  // newAngle argument to the enclosing function).
  // return function() {

    // To interpolate between the two angles, we use the default d3.interpolate.
    // (Internally, this maps to d3.interpolateNumber, since both of the
    // arguments to d3.interpolate are numbers.) The returned function takes a
    // single argument t and returns a number between the starting angle and the
    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
    // newAngle; and for 0 < t < 1 it returns an angle in-between.
    var interpolate = d3.interpolate(startAngle, newAngle);

    // The return value of the attrTween is also a function: the function that
    // we want to run for each tick of the transition. Because we used
    // attrTween("d"), the return value of this last function will be set to the
    // "d" attribute at every tick. (It’s also possible to use transition.tween
    // to run arbitrary code for every tick, say if you want to set multiple
    // attributes from a single function.) The argument t ranges from 0, at the
    // start of the transition, to 1, at the end.
    return function(t: number) {

      // Calculate the current arc angle based on the transition time, t. Since
      // the t for the transition and the t for the interpolate both range from
      // 0 to 1, we can pass t directly to the interpolator.
      //
      // Note that the interpolated angle is written into the element’s bound
      // data object! This is important: it means that if the transition were
      // interrupted, the data bound to the element would still be consistent
      // with its appearance. Whenever we start a new arc transition, the
      // correct starting angle can be inferred from the data.
      // d.endAngle = interpolate(t);

      // Lastly, compute the arc path given the updated data! In effect, this
      // transition uses data-space interpolation: the data is interpolated
      // (that is, the end angle) rather than the path string itself.
      // Interpolating the angles in polar coordinates, rather than the raw path
      // string, produces valid intermediate arcs during the transition.
      return arc({endAngle: interpolate(t)}) || '';
    };
  // };
}

export interface OptionalSupportParams {
  duration: number;
  color: ColorType;
}

export interface SupportParams extends Partial<OptionalSupportParams> {
  widthFactor: number;
  height: number;
}

export type SupportData = number[] | number[][];

function isMat(a: number[] | number[][]): a is number[][] {
  return Array.isArray(a[0]);
}

function getPatternIds(color: ColorType, keys: number[]) {
  return keys.map((key) => `stripe-${color(key).slice(1)}`);
}

export class SupportPainter implements Painter<SupportData, SupportParams> {
  public static defaultParams: OptionalSupportParams = {
    color: labelColor,
    duration: defaultDuration,
  };
  private params: SupportParams & OptionalSupportParams;
  private support: SupportData;
  update(params: SupportParams): this {
    this.params = {...(SupportPainter.defaultParams), ...(this.params), ...params};
    return this;
  }
  data(newData: SupportData): this {
    this.support = newData;
    return this;
  }
  render<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, any, GElement, any>,
  ): this {
    const support = this.support;
    if (isMat(support)) {
      this.renderSimple(selector, []);
      this.renderMat(selector, support);
    } else {
      this.renderMat(selector, []);
      this.renderSimple(selector, support);
    }
    return this;
  }
  renderSimple<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, any, GElement, any>,
    support: number[]
  ): this {
    const {duration, height, widthFactor, color} = this.params;
    
    const xs = [0, ...(nt.cumsum(support))];

    // Render
    // Join
    const rects = selector.selectAll('rect.mo-support').data(support);
    // Enter
    const rectsEnter = rects.enter().append('rect').attr('class', 'mo-support')
      .attr('height', height);
    // Update
    const rectsUpdate = rectsEnter.merge(rects)
      .style('fill', (d, i) => color(i));
    // Transition
    rectsUpdate.transition().duration(duration)
      .attr('width', (d) => d * widthFactor)
      .attr('x', (d, i) => xs[i] * widthFactor + i * 1.5)
      .attr('height', height);
    // Exit
    rects.exit().transition().duration(duration)
      .attr('width', 1e-6).remove();
    return this;
  }

  renderMat<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, any, GElement, any>,
    support: number[][]
  ): this {
    const { height, widthFactor, duration, color } = this.params;
    const trueLabels = support.map((s: number[]) => nt.sum(s));
    const predictions = support.length ? nt.sumVec(support) : [];
    const truePredictions = support.map((s, i) => s[i]);
    const total = nt.sum(predictions);
    const falsePredictions = nt.minus(predictions, truePredictions);
    const width = total * widthFactor;
  
    const widths = predictions.map((l) => l * widthFactor);
    const xs = [0, ...(nt.cumsum(widths))];
    // const ys = support.map((s, i) => s[i] / trueLabels[i] * height);
    // const heights = ys.map((y) => height - y);

    const acc = selector.selectAll('text.mo-acc')
      .data(total ? [nt.sum(truePredictions) / (total + 1e-6)] : []);
    const accUpdate = acc.enter().append('text')
      .attr('class', 'mo-acc')
      .attr('display', 'none')
      .merge(acc);
    accUpdate.attr('x', width + 5).attr('y', height / 2 + 5).text(d => `acc: ${d.toFixed(2)}`);

    selector.on('mouseover', () => {
      accUpdate.attr('display', null);
    }).on('mouseout', () => {
      accUpdate.attr('display', 'none');
    });

    // acc.exit().remove();

    // Render True Rects
    const trueData = support
      .map((s, i) => ({width: widths[i], x: xs[i], data: [truePredictions[i], falsePredictions[i]], label: i}))
      .filter(v => v.width > 0);
    // // Join
    // const rects = selector.selectAll('rect.mo-support-true')
    //   .data(trueData);
    // // Enter
    // const rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
    //   .attr('height', height);
    // // Update
    // const rectsUpdate = rectsEnter.merge(rects)
    //   .style('fill', d => color(d.label))
    //   .style('stroke', d => color(d.label));
    // // Transition
    // rectsUpdate.transition().duration(duration)
    //   .attr('width', d => d.width)
    //   .attr('x', (d, i) => d.x + i * 1.5)
    //   .attr('height', d => d.height);
    // // Exit
    // rects.exit().transition().duration(duration)
    //   .attr('width', 1e-6).remove();

    // Register the stripes
    const stripeNames = getPatternIds(color, d3.range(trueLabels.length));
    
    // Render the misclassified part using stripes
    const root = selector.selectAll<SVGGElement, number[]>('g.mo-support-mat')
      .data(trueData);
    // enter
    const rootEnter = root.enter().append<SVGGElement>('g')
      .attr('class', 'mo-support-mat');

    // update
    const rootUpdate = rootEnter.merge(root).style('stroke', d => color(d.label));

    // update transition
    rootUpdate.transition().duration(duration)
      .attr('transform', (d, i) => `translate(${d.x + i * 1.5},0)`);

    // root exit
    const exitTransition = root.exit().transition().duration(duration).remove();
    exitTransition.selectAll('rect.mo-support-mat').attr('width', 1e-6).attr('x', 1e-6);

    // stripe rects
    const rects = rootUpdate.selectAll('rect.mo-support-mat')
    .data((d) => {
      // const xs = [0, ...(nt.cumsum(d))];
      const base = nt.sum(d.data);
      let factor = base ? d.width / base : 0;
      const _widths = d.data.map(v => v * factor);
      const _xs = [0, ...nt.cumsum(_widths)];
      // console.log(factor); // tslint:disable-line
      const ret = d.data.map((v, j) => ({
        width: _widths[j], x: _xs[j], label: d.label,
        fill: j === 0 ? color(d.label) : `url("#${stripeNames[d.label]}")`
      }));
      return ret.filter(r => r.width > 0);
    });
    const stripeEnter = rects.enter().append('rect')
      .attr('class', 'mo-support-mat').attr('height', d => height);
    const stripeUpdate = stripeEnter.merge(rects)
      // .classed('striped', d => d.striped)
      // .style('stroke', d => color(d.label))
      // .style('display', d => d.striped ? 'inline' : 'none')
      .style('fill', d => d.fill);

    stripeUpdate.transition().duration(duration)
      .attr('height', d => height)
      .attr('width', d => d.width).attr('x', d => d.x);
    
    rects.exit().transition().duration(duration)
      .attr('width', 1e-6).attr('x', 1e-6).remove();

    return this;
  }

  renderMatBack<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, any, GElement, any>,
    support: number[][]
  ): this {
    const { height, widthFactor, duration, color } = this.params;
    const trueLabels = support.map((s: number[]) => nt.sum(s));
    // const total = nt.sum(trueLabels);
    // const width = total * widthFactor;
    const widths = trueLabels.map((l) => l * widthFactor);
    const xs = [0, ...(nt.cumsum(widths))];
    const ys = support.map((s, i) => s[i] / trueLabels[i] * height);
    // const heights = ys.map((y) => height - y);

    // Render True Rects
    const trueData = support
      .map((s, i) => ({width: widths[i], x: xs[i], height: ys[i], data: s, label: i}))
      .filter(v => v.width > 0);
    // Join
    const rects = selector.selectAll('rect.mo-support-true')
      .data(trueData);
    // Enter
    const rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
      .attr('height', height);
    // Update
    const rectsUpdate = rectsEnter.merge(rects)
      .style('fill', d => color(d.label))
      .style('stroke', d => color(d.label));
    // Transition
    rectsUpdate.transition().duration(duration)
      .attr('width', d => d.width)
      .attr('x', (d, i) => d.x + i * 1.5)
      .attr('height', d => d.height);
    // Exit
    rects.exit().transition().duration(duration)
      .attr('width', 1e-6).remove();

    // Register the stripes
    const stripeNames = getPatternIds(color, d3.range(trueLabels.length));
    
    // Render the misclassified part using stripes
    const root = selector.selectAll<SVGGElement, number[]>('g.mo-support-mat')
      .data(trueData);
    // enter
    const rootEnter = root.enter().append<SVGGElement>('g')
      .attr('class', 'mo-support-mat');

    // update
    const rootUpdate = rootEnter.merge(root).style('stroke', d => color(d.label));

    // update transition
    rootUpdate.transition().duration(duration)
      .attr('transform', (d, i) => `translate(${d.x + i * 1.5},${d.height})`);

    // root exit
    const exitTransition = root.exit().transition().duration(duration).remove();
    exitTransition.selectAll('rect.mo-support-mat').attr('width', 1e-6).attr('x', 1e-6);

    // stripe rects
    const stripeRects = rootUpdate.selectAll('rect.mo-support-mat')
    .data((d) => {
      // const xs = [0, ...(nt.cumsum(d))];
      const base = nt.sum(d.data) - d.data[d.label];
      let factor = base ? d.width / base : 0;
      const _widths = d.data.map((v, j) => j === d.label ? 0 : v * factor);
      const _xs = [0, ...nt.cumsum(_widths)];
      // console.log(factor); // tslint:disable-line
      const ret = d.data.map((v, j) => ({
        height: height - d.height, 
        width: _widths[j], x: _xs[j], label: j
      }));
      return ret.filter(r => r.width > 0);
    });
    const stripeEnter = stripeRects.enter().append('rect')
      .attr('class', 'mo-support-mat').attr('height', d => d.height);
    const stripeUpdate = stripeEnter.merge(stripeRects)
      // .classed('striped', d => d.striped)
      // .style('stroke', d => color(d.label))
      // .style('display', d => d.striped ? 'inline' : 'none')
      .style('fill', d => `url(#${stripeNames[d.label]})`);

    stripeUpdate.transition().duration(duration)
      .attr('height', d => d.height)
      .attr('width', d => d.width).attr('x', d => d.x);
    
    stripeRects.exit().transition().duration(duration)
      .attr('width', 1e-6).attr('x', 1e-6).remove();

    return this;
  }
}

export interface OptionalParams {
  color: ColorType;
  duration: number;
  fontSize: number;
  displayFidelity: boolean;
  displayEvidence: boolean;
  widthFactor: number;
}

export interface OutputParams extends Partial<OptionalParams> {
  // feature2Idx: (feature: number) => number;
  elemHeight?: number;
  onClick?: (feature: number, condition: number) => void;
}

export default class OutputPainter implements Painter<RuleX[], OutputParams> {
  public static defaultParams: OptionalParams = {
    color: labelColor,
    duration: defaultDuration,
    fontSize: 14,
    widthFactor: 200,
    displayEvidence: true,
    displayFidelity: true,
    // expandFactor: [4, 3],
  };
  private rules: RuleX[];
  private useMat: boolean;
  private params: OutputParams & OptionalParams;
  private supportPainter: SupportPainter;
  constructor() {
    this.params = {...(OutputPainter.defaultParams)};
    this.supportPainter = new SupportPainter();
  }
  
  update(params: OutputParams): this {
    this.params = {...(OutputPainter.defaultParams), ...(this.params), ...params};
    return this;
  }
  data(newData: RuleX[]): this {
    this.rules = newData;
    return this;
  }
  render<GElement extends d3.BaseType>(
    selector: d3.Selection<SVGGElement, any, GElement, any>,
  ): this {
    const { duration } = this.params;
    const rules = this.rules;
    this.useMat = rules.length > 0 && isMat(rules[0].support);
    // console.log('useMat', rules[0].support); // tslint:disable-line
    // console.log('useMat', this.useMat); // tslint:disable-line

    const collapseYs = new Map<string, number>();
    rules.forEach((r) => isRuleGroup(r) && r.rules.forEach((_r) => collapseYs.set(`o-${_r.idx}`, r.y)));
    this.renderHeader(selector);
    // ROOT Group
    const groups = selector.selectAll<SVGGElement, {}>('g.matrix-outputs')
      .data<RuleX>(rules, function (r: RuleX) { return r ? `o-${r.idx}` : this.id; });
    // Enter
    const groupsEnter = groups.enter()
      .append<SVGGElement>('g')
      .attr('class', 'matrix-outputs')
      .attr('id', d => `o-${d.idx}`)
      .attr('transform', d => d.parent ? `translate(10, ${d.y - 40})` : 'translate(10, 0)');
    // Update
    const groupsUpdate = groupsEnter.merge(groups)
      .classed('hidden', false).classed('visible', true);
    const updateTransition = groupsUpdate.transition().duration(duration)
      .attr('transform', d => `translate(10,${d.y})`);

    this.renderOutputs(groupsEnter, groupsUpdate, updateTransition);
    this.renderFidelity(groupsEnter, groupsUpdate, updateTransition);
    this.renderSupports(groupsEnter, groupsUpdate);

    // Exit
    groups.exit()
      .classed('hidden', true).classed('visible', false)
      .transition().duration(duration)
      .attr('transform', (d, i, nodes) => 
        `translate(10,${collapseYs.get(nodes[i].id)})`);
    return this;
  }

  public renderHeader(root: d3.Selection<SVGGElement, any, d3.BaseType, any>): this {
    // make sure the group exists
    // console.log('here'); // tslint:disable-line
    const {duration, displayEvidence, displayFidelity} = this.params;
    const rules = this.rules;

    // const confidence = nt.sum(rules.map((r) => r.totalSupport * r.output[r.label])) / totalSupport;
    root.selectAll('g.mo-headers').data(['g']).enter()
      .append('g').attr('class', 'mo-headers').attr('transform', 'translate(0,-20)');
    
    let headerTexts = ['Output (Pr)', 'Evidence'];
    let headerXs = [15, 80];
    let fillRatios = [0, 0];
    let rectWidths = [80, 67];

    if (this.useMat) {
      const totalSupport = nt.sum(rules.map((r) => r.totalSupport));
      const fidelity = nt.sum(
        rules.map(r => isMat(r.support) ? nt.sum(r.support.map(s => s[r.label])) : 0)
      ) / totalSupport;
    
      const acc = nt.sum(
        rules.map(r => isMat(r.support) ? nt.sum(r.support.map((s, i) => s[i])) : 0)
      ) / totalSupport;

      headerTexts = ['Output (Pr)', `Fidelity (${(fidelity * 100).toFixed(0)}/100)`, 
        `Evidence (Acc: ${acc.toFixed(2)})`];
      headerXs = [15, 75, 125];
      rectWidths = [80, 110, 135];
      fillRatios = [0, fidelity, acc];
    }
    if (!displayEvidence && headerTexts.length === 3) {
      headerTexts = headerTexts.slice(0, 2);
      if (!displayFidelity) {
        headerTexts = headerTexts.slice(0, 1);
      }
    } else if (!displayFidelity) {
      headerTexts = headerTexts.slice(0, 1);
    }

    const headers = root.select('g.mo-headers');

    const header = headers.selectAll('g.mo-header').data(headerTexts);
    const headerEnter = header.enter().append('g').attr('class', 'mo-header')
      .attr('transform', (d, i) => `translate(${headerXs[i]},0) rotate(-50)`)
      .style('font-size', 14);

    // rects
    headerEnter.append('rect')
      .attr('class', 'mo-header-box')
      .style('stroke-width', 1).style('stroke', '#1890ff').style('fill', '#fff')
      .attr('width', (d, i) => rectWidths[i]).attr('height', 20)
      .attr('rx', 2).attr('ry', 2);

    // rects
    headerEnter.append('rect').attr('class', 'mo-header-fill')
      .style('stroke-width', 1).style('stroke', '#1890ff')
      .style('fill', '#1890ff').style('fill-opacity', 0.1)
      .attr('height', 20)
      .attr('rx', 2).attr('ry', 2);

    // texts
    headerEnter.append('text')
      .attr('class', 'mo-header-text')
      .attr('text-anchor', 'start')
      .attr('fill', '#1890ff')
      .attr('dx', 3).attr('dy', 15);
    // Update
    const headerUpdate = headerEnter.merge(header);
    headerUpdate.select('text.mo-header-text').text(d => d);
    const transition = headerUpdate.transition().duration(duration)
      .attr('transform', (d, i) => `translate(${headerXs[i]},0) rotate(-50)`);
    transition.select('rect.mo-header-box').attr('width', (d, i) => rectWidths[i]);
    transition.select('rect.mo-header-fill')
      .attr('width', (d, i) => fillRatios[i] * rectWidths[i]);
    
    // textsEnter.merge(texts).text(d => d);
    return this;
  }

public renderOutputs(
    enter: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>,
    update: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>,
    updateTransition: d3.Transition<SVGGElement, RuleX, SVGGElement, RuleX[]>
  ): this {
    const {fontSize, color, duration} = this.params;
    // const outputWidth = fontSize * 2;

    // *Output Texts*
    // Enter
    enter.append('text').attr('class', 'mo-output').attr('text-anchor', 'middle').attr('dx', 15);
    // Update
    update.select('text.mo-output')
      .attr('font-size', d => isRuleGroup(d) ? fontSize * 0.8 : fontSize)
      .text((d: RuleX) =>
        isRuleGroup(d) ? '' : (Math.round(d.output[d.label] * 100) / 100).toFixed(2)
      );  // confidence as text

    // Transition
    updateTransition.select('text.mo-output')
      .style('fill', d => 
        color(d.label)
        // d3.interpolateRgb.gamma(2.2)('#ccc', '#000')(d.output[d.label] * 2 - 1)
        // d3.interpolateRgb.gamma(2.2)('#ddd', color(d.label))(d.output[d.label] * 2 - 1)
      )      
      .attr('dy', d => d.height / 2 + fontSize * 0.4);

    // *Output Bars*
    const rectHeight = fontSize;
    enter.append('g').attr('class', 'mo-outputs');
    // Transition
    updateTransition.select('g.mo-outputs')
      .attr('transform', d => `translate(30,${d.height / 2 - fontSize * 0.4})`);

    // Rects
    const rects = update.select('g.mo-outputs')
      .selectAll('rect')
      .data(d => {
        if (isRuleGroup(d)) return [];
        let y = 0;
        return d.output.map(o => {
          const ret = {o, y};
          y += o * rectHeight;
          return ret;
        });
      });
    
    const rectsUpdate = rects.enter().append('rect')
      .merge(rects);
    rectsUpdate.attr('width', 3).style('fill', (d, i) => color(i))
      .transition().duration(duration)
      .attr('height', d => d.o * rectHeight)
      .attr('y', d => d.y);
    
    rects.exit().transition().duration(duration)
      .style('fill-opacity', 1e-6).remove();

    enter.append('path').attr('class', 'mo-divider')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#444')
      .attr('d', d => `M 60 0 V ${d.height}`);

    update.select('path.mo-divider').attr('d', d => `M 50 0 V ${d.height}`);
    return this;
  }

  public renderFidelity(
    enter: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>,
    update: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>,
    updateTransition: d3.Transition<SVGGElement, RuleX, SVGGElement, RuleX[]>
  ): this {
    const {duration, displayFidelity} = this.params;
    if (!displayFidelity) {
      update.select<SVGGElement>('g.mo-fidelity').attr('display', 'none');
      return this;
    }
    const fontSize = 13;
    const innerRadius = fontSize * 0.9;
    // const outputWidth = fontSize * 2;
    const dx = 80;
    const arc = d3.arc<any>().innerRadius(innerRadius).outerRadius(innerRadius + 2).startAngle(0);
    // *Output Texts*
    // Enter
    const enterGroup = enter.append('g').attr('class', 'mo-fidelity');
    enterGroup.append('text').attr('class', 'mo-fidelity').attr('text-anchor', 'middle');
    enterGroup.append('path').attr('class', 'mo-fidelity')
      .attr('angle', 1e-4)
      .attr('d', arc({endAngle: 1e-4}) as string);

    // Update
    const updateGroup = update.select<SVGGElement>('g.mo-fidelity')
      .datum(d => {
        const fidelity = isMat(d.support) 
          ? (nt.sum(d.support.map(s => s[d.label])) / (d.totalSupport + 1e-6)) : undefined;
        const color = fidelity !== undefined 
          ? (fidelity > 0.8 ? '#52c41a' :  fidelity > 0.5 ? '#faad14' : '#f5222d') : null;
        const angle = (!isRuleGroup(d) && fidelity !== undefined) ? (Math.PI * fidelity * 2 - 1e-3) : 0;
        return {...d, fidelity, color, angle};
      });
    updateGroup.select('text.mo-fidelity')
      .attr('font-size', d => isRuleGroup(d) ? fontSize * 0.8 : fontSize)
      .attr('dy', fontSize * 0.4)
      // .attr('dx', dx)
      .text(d =>
        (!isRuleGroup(d) && d.fidelity !== undefined) ? (Math.round(d.fidelity * 100)).toFixed(0) : ''
      )
      .style('fill', d => d.color);

    // Join
    updateGroup.transition().duration(duration)
      .attr('transform', d => `translate(${dx}, ${d.height / 2})`)
      .select('path.mo-fidelity')
       // update pos
      .attrTween('d', function (d: any) {
        const angle = Number(d3.select(this).attr('angle'));
        return arcTween(angle, (!isRuleGroup(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0, arc);
      })
      // .attr('d', d => arc({endAngle: (!isRuleGroup(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0}))
      .style('fill', d => d.color)
      .attr('angle', d => d.angle);
    // Enter + Merge
    // const pathsUpdate = paths.enter()
    //   .append('path').attr('d', d => arc({endAngle: 0}))
    //   .attr('class', 'mo-fidelity')
    //   .merge(paths);

    // // transition
    // pathsUpdate.transition().duration(duration)
    //   .attr('d', d => arc({endAngle: Math.PI * d * 2}));
    
    // paths.exit().transition().duration(duration)
    //   .style('fill-opacity', 1e-6).remove();
    return this;
  }

  renderSupports(
    enter: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>,
    update: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>
  ): this {
    const { duration, fontSize, widthFactor, color, elemHeight, displayEvidence } = this.params;
    if (!displayEvidence) {
      update.select<SVGGElement>('g.mo-supports').attr('display', 'none');
      return this;
    }
    const useMat = this.useMat;
    // Enter
    enter.append('g').attr('class', 'mo-supports');
    // Update
    const supports = update.select<SVGGElement>('g.mo-supports');
    supports.transition().duration(duration)
      .attr('transform', ({height}) => {
        const x = useMat ? (fontSize * 8) : (fontSize * 5);
        const y = (elemHeight && elemHeight < height) ? ((height - elemHeight) / 2) : 0;
        return `translate(${x},${y})`;
    });

    // const height = supports.each
    // supports
    supports.each(({support, height}, i, nodes) => 
      support && this.supportPainter
        .update({widthFactor, height: (elemHeight && elemHeight < height) ? elemHeight : height, color})
        .data(support)
        .render(d3.select(nodes[i]))
    );

    return this;
  }
}
