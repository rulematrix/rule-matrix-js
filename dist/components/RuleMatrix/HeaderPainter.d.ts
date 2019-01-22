import * as d3 from 'd3';
import { Painter } from '../Painters';
import { Feature } from './models';
export interface OptionalParams {
    duration: number;
    rotate: number;
    headerSize: number;
    margin: {
        left: number;
        right: number;
    };
    maxHeight: number;
}
export interface HeaderParams extends Partial<OptionalParams> {
    onClick?: (feature: number) => void;
}
export default class HeaderPainter implements Painter<Feature[], HeaderParams> {
    static defaultParams: OptionalParams;
    private features;
    private params;
    constructor();
    update(params: HeaderParams): this;
    data(newData: Feature[]): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGGElement, any, GElement, any>): this;
}
