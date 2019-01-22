import * as d3 from 'd3';
export interface Painter<DataType, ParamsType> {
    update(params: ParamsType): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, DataType, GElement, any>): this;
}
export declare type ColorType = (i: number) => string;
export declare const googleColor: ColorType;
export declare const defaultColor: ColorType;
export declare const labelColor: ColorType;
export declare const sequentialColors: (n: number) => ColorType;
export declare const divergingColors: (n: number) => ColorType;
export declare const defaultDuration = 400;
