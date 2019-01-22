import { ModelBase, ModelMeta } from './base';
import { SupportType } from './data';
export interface Discretizer {
    readonly cutPoints: number[] | null;
    readonly intervals: [number | null, number | null][] | null;
    readonly min: number;
    readonly max: number;
}
export interface Condition {
    readonly feature: number;
    readonly category: number;
    rank?: number;
}
export interface Rule {
    readonly conditions: Condition[];
    readonly output: number[];
    readonly label: number;
    readonly idx: number;
    readonly cover: number;
    support?: number[][];
    _support?: number[];
    totalSupport?: number;
    fidelity?: number;
    parent?: RuleGroup;
}
export declare function updateRuleSupport(r: Rule, support?: number[] | number[][]): void;
export interface RuleGroup extends Rule {
    readonly rules: Rule[];
}
export declare function isRuleGroup(rule: Rule | RuleGroup): rule is RuleGroup;
export interface RuleModel extends ModelBase {
    readonly type: 'rule';
    readonly rules: Rule[];
    readonly discretizers: Discretizer[];
    readonly supports: number[][];
    readonly supportMats: number[][][];
    readonly useSupportMat: boolean;
}
export declare function isRuleModel(model: ModelBase): model is RuleModel;
export declare class RuleList implements RuleModel {
    readonly type: 'rule';
    readonly name: string;
    readonly nFeatures: number;
    readonly nClasses: number;
    readonly meta: ModelMeta;
    readonly rules: Rule[];
    readonly target?: string;
    readonly discretizers: Discretizer[];
    supports: number[][];
    supportMats: number[][][];
    useSupportMat: boolean;
    maxSupport: number;
    constructor(raw: RuleModel);
    support(newSupport: SupportType): this;
    getSupport(): number[][];
    predict(data: number[]): number;
    getRules(): Rule[];
    categoryInterval(f: number, c: number): [number, number];
    categoryMathDesc(f: number, c: number): string;
    categoryDescription(f: number, c: number, abr?: boolean, maxLength?: number): string;
    categoryHistRange(f: number, c: number): [number, number];
    interval2HistRange(f: number, interval: [number | null, number | null]): [number, number];
}
