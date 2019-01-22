import * as d3 from 'd3';
import { Painter, ColorType } from './Painter';
import './HistPainter.css';
export declare type Section = number[] | Int32Array;
export interface OptionalParams {
    color: ColorType;
    duration: number;
    margin: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    height: number;
    width: number;
}
export interface StreamParams extends Partial<OptionalParams> {
    interval?: [number, number];
    range?: [number, number];
    xs?: number[];
    yMax?: number;
}
export default class StreamPainter implements Painter<Section[], StreamParams> {
    static defaultParams: OptionalParams;
    private params;
    private stream;
    private initPos;
    constructor();
    update(params: StreamParams): this;
    data(newData: Section[]): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, any, GElement, any>): this;
    renderBrush<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, Section[], GElement, any>, xScaler?: d3.ScaleLinear<number, number>): this;
}
