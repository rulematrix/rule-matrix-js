import * as d3 from 'd3';
import { Painter, ColorType } from './Painter';
import * as nt from '../../service/num';
import './HistPainter.css';
export declare type Hist = nt.Vector;
export interface OptionalParams {
    color: ColorType;
    duration: number;
    mode: 'overlay' | 'stack';
    padding: number;
    margin: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    height: number;
    width: number;
    opacity: number;
}
export interface HistParams extends Partial<OptionalParams> {
    interval?: [number, number];
    range?: [number, number];
    xs?: number[];
    yMax?: number;
}
export default class HistPainter implements Painter<Hist[], HistParams> {
    static defaultParams: OptionalParams;
    private params;
    private hists;
    update(params: HistParams): this;
    data(newData: Hist[]): this;
    render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, any, GElement, any>): this;
    renderBrush<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, Hist[], GElement, any>, xScaler?: (x: number) => number): this;
    renderOverlay<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, Hist[], GElement, any>): this;
    renderStack<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, Hist[], GElement, any>): this;
}
