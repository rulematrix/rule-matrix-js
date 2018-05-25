import * as d3 from 'd3';
import * as nt from '../service/num';
import { ModelBase, ModelMeta, SupportType, isSupportMat } from './index';
import { nBins } from '../config';

export interface Discretizer {
  readonly cutPoints: number[] | null;
  readonly intervals: [number | null, number | null][] | null;
  readonly min: number;
  readonly max: number;
}

// Rule Model

export interface Condition {
  readonly feature: number;
  readonly category: number;
  rank?: number;
  // readonly support: number;
}

export interface Rule {
  readonly conditions: Condition[];
  readonly output: number[];
  readonly label: number;
  readonly idx: number;
  readonly cover: number;
  support: number[] | number[][];
  _support: number[];
  totalSupport: number;
  parent?: RuleGroup;
  // _support: number;  // the origin number of support obtained during training
}

export interface RuleGroup extends Rule {
  readonly rules: Rule[];
}

export function isRuleGroup(rule: Rule | RuleGroup): rule is RuleGroup {
  return (<RuleGroup> rule).rules !== undefined;
}

export interface RuleModel extends ModelBase {
  readonly type: 'rule';
  readonly rules: Rule[];
  readonly discretizers: Discretizer[];
  readonly supports: number[][];
  readonly supportMats: number[][][];
  readonly useSupportMat: boolean;
}

export function isRuleModel(model: ModelBase): model is RuleModel {
  return model.type === 'rule';
}

function toString(n: number, precision: number = 1): string {
  const bit = Math.floor(Math.log10(n));
  if (bit < -precision - 1) return n.toExponential(precision);
  if (bit < precision) return n.toFixed(precision - bit);
  if (bit < precision + 3)
    return n.toFixed(0);
  return n.toPrecision(precision + 1);
}

export class RuleList implements RuleModel {
  public readonly type: 'rule';
  public readonly name: string;
  public readonly nFeatures: number;
  public readonly nClasses: number;
  public readonly meta: ModelMeta;
  public readonly rules: Rule[];
  public readonly target?: string;
  public readonly discretizers: Discretizer[];
  public supports: number[][];
  public supportMats: number[][][];
  public useSupportMat: boolean;
  public maxSupport: number;

  constructor(raw: RuleModel) {
    const {type, name, nFeatures, nClasses, meta, rules, supports, discretizers} = raw;
    this.type = type;
    this.name = name;
    this.nFeatures = nFeatures;
    this.nClasses = nClasses;
    this.meta = meta;
    this.rules = rules;
    this.supports = supports;
    this.discretizers = discretizers;
    this.rules.forEach((r, i) => {
      r._support = nt.isMat(r.support) ? r.support.map(s => nt.sum(s)) : r.support;
    });
    this.maxSupport = d3.max(supports, nt.sum) || 0.1;
    // this.minSupport = 0.01;
    this.useSupportMat = false;
    // if (target) this.target = target;

    // bind this
    this.categoryInterval = this.categoryInterval.bind(this);
    this.categoryDescription = this.categoryDescription.bind(this);
    this.categoryHistRange = this.categoryHistRange.bind(this);
    this.interval2HistRange = this.interval2HistRange.bind(this);
  }

  public support(newSupport: SupportType): this {
    if (newSupport.length !== this.rules.length) {
      throw `Shape not match! newSupport has length ${newSupport.length}, but ${this.rules.length} is expected`;
    }
    if (isSupportMat(newSupport)) {
      this.supportMats = newSupport;
      this.rules.forEach((r, i) => (r.support = newSupport[i]));
      this.useSupportMat = true;
      this.maxSupport = d3.max(newSupport, mat => nt.sum(nt.sumVec(mat))) || 0.1;
    } else {
      this.supports = newSupport;
      this.useSupportMat = false;
      this.maxSupport = d3.max(newSupport, nt.sum) || 0.1;
    }
    this.rules.forEach((r, i) => {
      const support = newSupport[i];
      r.support = support;
      if (nt.isMat(support)) {
        r._support = support.map(s => nt.sum(s));
      } else {
        r._support = support;
      }
      r.totalSupport = nt.sum(r._support);
    });
    // console.log('Support changed'); // tslint:disable-line
    
    return this;
  }

  public getSupport(): number[][] {
    return this.supports;
  }
  
  public predict(data: number[]): number {
    if (data.length !== this.meta.featureNames.length) {
      console.warn('The input data does not has the same length as the featureNames!');
    }
    const rules = this.rules;
    const discretizers = this.discretizers;
    for (let i = 0; i < rules.length; i++) {
      const {conditions} = rules[i];
      const flags: boolean[] = conditions.map(({feature, category}) => {
        const intervals = discretizers[feature].intervals;
        if (intervals) {
          const interval = intervals[category];
          const low = interval[0] || -Infinity;
          const high = interval[1] || Infinity;
          return low < data[feature] && data[feature] < high;
        }
        return data[feature] === category;
      });
      if (flags.every(f => f)) return i;
    }
    return rules.length - 1;
  }

  public getRules(): Rule[] {
    return this.rules;
  }
  public categoryInterval(f: number, c: number): [number, number] {
    if (f < 0 || c < 0) return [0, 0];
    const {ranges} = this.meta;
    const intervals = this.discretizers[f].intervals;
    if (intervals) {
      const [r0, r1] = intervals[c];
      return [r0 === null ? ranges[f][0] : r0, r1 === null ? ranges[f][1] : r1];
    }
    return [c - 0.5, c + 0.5];
  }
  public categoryMathDesc(f: number, c: number): string {
    if (f < 0 || c < 0) return 'default';
    const intervals = this.discretizers[f].intervals;
    if (intervals) {
      // console.log(c); // tslint:disable-line
      const [r0, r1] = intervals[c];
      return `${r0 === null ? '(∞' : `[${toString(r0)}`},${r1 === null ? '∞' : toString(r1)})`;
    }
    const categories = this.meta.categories[f];
    return categories ? categories[c] : 'error!';
  }
  public categoryDescription(f: number, c: number, abr: boolean = false, maxLength: number = 20): string {
    if (f < 0 || c < 0) return '';
    const {featureNames, categories} = this.meta;
    const cutSize = Math.round((maxLength - 2) / 2);
    const featureName = featureNames[f];
    const intervals = this.discretizers[f].intervals;
    const category = intervals ? intervals[c] : c;
    let featureMap = (feature: string): string => `${feature} is any`;
    if (typeof category === 'number' && categories) {
      featureMap = (feature: string) => `${feature} = ${(<string[]> categories[f])[c]}`;
    } else {
      const low = category[0];
      const high = category[1];
      if (low === null && high === null) featureMap = (feature: string) => `${feature} is any`;
      else {
        const lowString = low !== null ? `${low.toPrecision(3)} < ` : '';
        const highString = high !== null ? ` < ${high.toPrecision(3)}` : '';
        featureMap = (feature: string) => lowString + feature + highString;
      }
    }
    if (abr) {
      const abrString = featureName.length > maxLength
      ? `"${featureName.substr(0, cutSize)}…${featureName.substr(-cutSize, cutSize)}"`
      : featureName;
      return featureMap(abrString);
    }
    return featureMap(featureName);
  }
  public categoryHistRange(f: number, c: number): [number, number] {
    if (this.meta.isCategorical[f]) return [c - 0.5, c + 0.5];
    return this.interval2HistRange(f, this.categoryInterval(f, c));
  }

  public interval2HistRange(f: number, interval: [number | null, number | null]): [number, number] {
    if (this.meta.isCategorical[f]) console.warn(`categorical feature ${f} cannot call this function!`);
    const range = this.meta.ranges[f];
    const i0 = interval[0] || range[0];
    const i1 = interval[1] || range[1];
    const step = (range[1] - range[0]) / nBins;
    return [(i0 - range[0]) / step, (i1 - range[0]) / step];
  }

}
