import * as d3 from 'd3';
import { Painter, ColorType } from '../Painters';
import { RuleX } from './models';
export interface OptionalSupportParams {
    duration: number;
    color: ColorType;
}
export interface SupportParams extends Partial<OptionalSupportParams> {
    widthFactor: number;
    height: number;
}
export declare type SupportData = number[] | number[][];
export declare class SupportPainter implements Painter<SupportData, SupportParams> {
    static defaultParams: OptionalSupportParams;
    private params;
    private support;
    update(params: SupportParams): this;
    data(newData: SupportData): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, any, GElement, any>): this;
    renderSimple<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, any, GElement, any>, support: number[]): this;
    renderMat<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, any, GElement, any>, support: number[][]): this;
    renderMatBack<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, any, GElement, any>, support: number[][]): this;
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
    elemHeight?: number;
    onClick?: (feature: number, condition: number) => void;
}
export default class OutputPainter implements Painter<RuleX[], OutputParams> {
    static defaultParams: OptionalParams;
    private rules;
    private useMat;
    private params;
    private supportPainter;
    constructor();
    update(params: OutputParams): this;
    data(newData: RuleX[]): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, any, GElement, any>): this;
    renderHeader(root: d3.Selection<SVGGElement, any, d3.BaseType, any>): this;
    renderOutputs(enter: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>, update: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>, updateTransition: d3.Transition<SVGGElement, RuleX, SVGGElement, RuleX[]>): this;
    renderFidelity(enter: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>, update: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>, updateTransition: d3.Transition<SVGGElement, RuleX, SVGGElement, RuleX[]>): this;
    renderSupports(enter: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>, update: d3.Selection<SVGGElement, RuleX, SVGGElement, RuleX[]>): this;
}
