import * as d3 from 'd3';
import { ColorType, Painter } from '../Painters';
import { RuleX, ConditionX } from './models';
export interface ConditionPainterParams {
    duration: number;
    color: ColorType;
}
export declare class ConditionPainter implements Painter<ConditionX, ConditionPainterParams> {
    private params;
    private histPainter;
    private streamPainter;
    constructor();
    update(params: ConditionPainterParams): this;
    data(newData: ConditionX): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, ConditionX, GElement, any>): this;
}
export interface OptionalParams {
    labelColor: ColorType;
    duration: number;
    buttonSize: number;
    onClickButton: () => void;
}
export interface RuleRowParams extends Partial<OptionalParams> {
    onClick?: (feature: number) => void;
    tooltip?: d3.Selection<SVGGElement, any, any, any>;
}
export default class RuleRowPainter implements Painter<RuleX, RuleRowParams> {
    static defaultParams: OptionalParams;
    private params;
    private conditionPainter;
    private rule;
    constructor();
    update(params: RuleRowParams): this;
    data(newData: RuleX): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, RuleX, GElement, any>): this;
    renderButton(selector: d3.Selection<SVGGElement, {}, d3.BaseType, any>): void;
}
