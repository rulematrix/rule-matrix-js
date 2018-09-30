import { Rule, Condition } from '../../models';
import { Stream } from '../../models/data';

export interface ConditionX extends Condition {
  title: string;
  desc: string;
  ruleIdx: number;
  interval: [number, number];
  range: [number, number];
  // histRange: [number, number];
  // activeRatio: [number, number];
  expanded?: boolean;
  active?: boolean;
  stream?: Stream;
  value?: number;
  isCategorical: boolean;
  x: number;
  width: number;
  height: number;
}

export interface RuleX extends Rule {
  conditions: ConditionX[];
  x: number;
  y: number;
  highlight?: boolean;
  height: number;
  width: number;
  expanded: boolean;
  _support: number[];
  // support?: number[] | number[][];
  // support: number[];
  // totalSupport: number;
  // collapsed?: boolean;
}

export interface Feature {
  text: string;
  feature: number;
  x: number;
  width: number;
  count: number;
  categories?: string[] | null;
  cutPoints?: number[] | null;
  range?: [number, number];
  expanded?: boolean;
}

// export class RuleX implements RuleX {
//   constructor
// }