import * as d3 from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
// export interface Painter<DataType> {
//   // new (data: DataType, styles: StyleType, params: ParamType): Painter<DataType, StyleType, ParamType>
//   update<GElement extends d3.BaseType>(
//     selector: d3.Selection<SVGElement, DataType, GElement, any>,
//     ...args: any[]
//   ): void;
//   // doJoin<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, DataType, GElement, any>):
//   // d3.Selection<SVGElement, DataType, GElement, any>;
//   // doEnter<GElement extends d3.BaseType>(entered: d3.Selection<d3.EnterElement, DataType, GElement, any>):
//   // d3.Selection<SVGElement, DataType, GElement, any>;
//   // doUpdate<GElement extends d3.BaseType>(merged: d3.Selection<SVGElement, DataType, GElement, any>): void;
//   // doExit<PElement extends d3.BaseType>(exited: d3.Selection<SVGElement, DataType, PElement, any>): void;
// }

export interface Painter<DataType, ParamsType> {
  update(params: ParamsType): this;
  data(newData: DataType): this;
  render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, DataType, GElement, any>): this;
}

export type ColorType = (i: number) => string;

const gColor = [
  '#3366cc',
  '#ff9900',
  '#109618',
  '#990099',
  '#dc3912',
  '#0099c6',
  '#dd4477',
  '#66aa00',
  '#b82e2e',
  '#316395',
  '#994499',
  '#22aa99',
  '#aaaa11',
  '#6633cc',
  '#e67300',
  '#8b0707',
  '#651067',
  '#329262',
  '#5574a6',
  '#3b3eac'
];

export const googleColor: ColorType = (n: number) => gColor[n % gColor.length];

export const defaultColor: ColorType = d3.scaleOrdinal<number, string>(d3ScaleChromatic.schemeSet1 as string[]);

// export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
// export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory20 as string[]);
export const labelColor = googleColor;

export const sequentialColors: (n: number) => ColorType = (n: number) => 
  (d3.scaleOrdinal<number, string>(d3ScaleChromatic.schemeBlues[n] as string[]));

export const divergingColors: (n: number) => ColorType = (n: number) => 
  (d3.scaleOrdinal<number, string>(d3ScaleChromatic.schemeRdBu[n] as string[]));

export const defaultDuration = 400;
