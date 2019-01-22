import { ColorType, Painter } from '../Painters';
import './FlowPainter.css';
export interface FlowOptional {
    width: number;
    dx: number;
    dy: number;
    height: number;
    duration: number;
    color: ColorType;
    divideHeight: number;
}
export interface FlowPainterParams extends Partial<FlowOptional> {
}
export declare type Flow = {
    support: number[];
    y: number;
};
export default class FlowPainter implements Painter<Flow[], FlowPainterParams> {
    static defaultParams: FlowOptional;
    private params;
    private flows;
    private flowSums;
    private reserves;
    private reserveSums;
    update(params: FlowPainterParams): this;
    data(flows: Flow[]): this;
    render(selector: d3.Selection<SVGGElement, any, any, any>): this;
    renderRects(root: d3.Selection<SVGGElement, any, any, any>): this;
    renderFlows(root: d3.Selection<SVGGElement, any, any, any>): this;
}
