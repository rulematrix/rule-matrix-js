import * as d3 from 'd3';
import * as nt from '../service/num';
import { ModelBase, SupportType, isSupportMat } from './index';
import { BaseModel } from './base';

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
  readonly supports: number[][];
  readonly supportMats: number[][][];
  readonly useSupportMat: boolean;
  // readonly discretizers: Discretizer[];
}

export function isRuleModel(model: ModelBase): model is RuleModel {
  return model.type === 'rule';
}

export class RuleList extends BaseModel implements RuleModel {
  public readonly type: 'rule';
  public readonly rules: Rule[];
  public readonly target?: string;
  public supports: number[][];
  public supportMats: number[][][];
  public useSupportMat: boolean;
  public maxSupport: number;

  constructor(raw: RuleModel) {
    super(raw);
    const { rules, target, supports } = raw;
    this.rules = rules;
    this.supports = supports;
    this.rules.forEach((r, i) => {
      r._support = nt.isMat(r.support) ? r.support.map(s => nt.sum(s)) : r.support;
    });
    this.maxSupport = d3.max(supports, nt.sum) || 0.1;
    // this.minSupport = 0.01;
    this.useSupportMat = false;
    this.type = 'rule';
    if (target) this.target = target;
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
    console.log('Support changed'); // tslint:disable-line
    
    // this._minSupport = 0;
    // this.rules.forEach((r: Rule, i: number) => r.support = newSupport[i]);
    return this;
  }

  public getSupport(): number[][] {
    return this.supports;
    // if (this._minSupport !== this.minSupport)
    //   this.computeGroups();
    // return this.groupedSupports;
  }

  public getSupportOrSupportMat(): number[][] | number[][][] {
    // if (this._minSupport !== this.minSupport)
    //   this.computeGroups();
    if (this.useSupportMat) return this.supportMats;
    return this.supports;
  }

  public predict(data: number[]): number {
    if (data.length !== this.meta.featureNames.length) {
      console.warn('The input data does not has the same length as the featureNames!');
    }
    const rules = this.rules;
    const {discretizers} = this.meta;
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

  // public setMinSupport(minSupport: number): this {
  //   this.minSupport = minSupport;
  //   return this;
  // }

  public getRules(): Rule[] {
    return this.rules;
  }
  // public getRules(): Rule[] {
  //   if (!this.groupedRules || this._minSupport !== this.minSupport) {
  //     this.computeGroups();
  //   }
  //   return this.groupedRules;
  // }

}
