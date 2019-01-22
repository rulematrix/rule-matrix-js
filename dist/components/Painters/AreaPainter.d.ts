import * as d3 from 'd3';
import { Painter, ColorType } from './Painter';
import { Histogram } from '../../models';
import './index.css';
export interface OptionalParams {
    width: number;
    height: number;
    color: ColorType;
    hasAxis: boolean;
}
export interface AreaPainterParams extends Partial<OptionalParams> {
}
export declare class AreaPainter implements Painter<Histogram[], Partial<AreaPainterParams>> {
    static defaultParams: {
        width: number;
        height: number;
        color: ColorType;
        hasAxis: boolean;
    };
    private params;
    private hists;
    constructor();
    update(params: AreaPainterParams): this;
    data(hists: Histogram[]): this;
    render(selector: d3.Selection<SVGElement, any, any, any>): this;
}
