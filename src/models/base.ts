import { nBins } from '../config';

export interface Discretizer {
  readonly cutPoints: number[] | null;
  readonly intervals: [number | null, number | null][] | null;
  readonly min: number;
  readonly max: number;
}

export interface ModelMeta {
  readonly featureNames: string[];
  readonly labelNames: string[];
  readonly isCategorical: boolean[];
  readonly ranges: [number, number][];
  readonly categories: (string[] | null)[];
  readonly discretizers: Discretizer[];
}

export interface ModelBase {
  readonly type: string;
  readonly name: string;
  readonly dataset: string;
  readonly nFeatures: number;
  readonly nClasses: number;
  readonly meta: ModelMeta;
  [propName: string]: any;
  // predict(x: Float32Array | Int32Array): Promise<number>;
  // predictProb(x: Float32Array | Int32Array): Promise<Float32Array>;
}

function toString(n: number, precision: number = 1): string {
  const bit = Math.floor(Math.log10(n));
  if (bit < -precision - 1) return n.toExponential(precision);
  if (bit < precision) return n.toFixed(precision - bit);
  if (bit < precision + 3)
    return n.toFixed(0);
  return n.toPrecision(precision + 1);
}

export class BaseModel implements ModelBase {
  public readonly type: string;
  public readonly name: string;
  public readonly dataset: string;
  public readonly nFeatures: number;
  public readonly nClasses: number;
  public readonly meta: ModelMeta;

  constructor(raw: ModelBase) {
    const {type, name, dataset, nFeatures, nClasses, meta} = raw;
    this.type = type;
    this.name = name;
    this.dataset = dataset;
    this.nFeatures = nFeatures;
    this.nClasses = nClasses;
    this.meta = meta;
    this.categoryInterval = this.categoryInterval.bind(this);
    this.categoryDescription = this.categoryDescription.bind(this);
    this.categoryHistRange = this.categoryHistRange.bind(this);
    this.interval2HistRange = this.interval2HistRange.bind(this);
  }
  public categoryInterval(f: number, c: number): [number, number] {
    if (f < 0 || c < 0) return [0, 0];
    const {discretizers, ranges} = this.meta;
    const intervals = discretizers[f].intervals;
    if (intervals) {
      const [r0, r1] = intervals[c];
      return [r0 === null ? ranges[f][0] : r0, r1 === null ? ranges[f][1] : r1];
    }
    return [c - 0.5, c + 0.5];
  }
  public categoryMathDesc(f: number, c: number): string {
    if (f < 0 || c < 0) return 'default';
    const intervals = this.meta.discretizers[f].intervals;
    if (intervals) {
      // console.log(c); // tslint:disable-line
      const [r0, r1] = intervals[c];
      return `${r0 === null ? '(∞' : `[${toString(r0)}`},${r1 === null ? '∞' : toString(r1)})`;
    }
    const categories = this.meta.categories[f];
    return categories ? categories[c] : 'error!';
  }
  public categoryDescription(f: number, c: number, abr: boolean = false, maxLength: number = 20): string {
    if (f < 0 || c < 0) return '';
    const {featureNames, discretizers, categories} = this.meta;
    // console.log(f); // tslint:disable-line
    // console.log(discretizers); // tslint:disable-line
    const cutSize = Math.round((maxLength - 2) / 2);
    const featureName = featureNames[f];
    const intervals = discretizers[f].intervals;
    const category = intervals ? intervals[c] : c;
    let featureMap = (feature: string): string => `${feature} is any`;
    if (typeof category === 'number' && categories) {
      featureMap = (feature: string) => `${feature} = ${(<string[]> categories[f])[c]}`;
    } else {
      // console.log(intervals); // tslint:disable-line
      // console.log(f); // tslint:disable-line
      // console.log(c); // tslint:disable-line
      const low = category[0];
      const high = category[1];
      if (low === null && high === null) featureMap = (feature: string) => `${feature} is any`;
      else {
        const lowString = low !== null ? `${low.toPrecision(3)} < ` : '';
        const highString = high !== null ? ` < ${high.toPrecision(3)}` : '';
        featureMap = (feature: string) => lowString + feature + highString;
      }
    }
    if (abr) {
      const abrString = featureName.length > maxLength
      ? `"${featureName.substr(0, cutSize)}…${featureName.substr(-cutSize, cutSize)}"`
      : featureName;
      return featureMap(abrString);
    }
    return featureMap(featureName);
  }
  public categoryHistRange(f: number, c: number): [number, number] {
    if (this.meta.isCategorical[f]) return [c - 0.5, c + 0.5];
    return this.interval2HistRange(f, this.categoryInterval(f, c));
  }

  public interval2HistRange(f: number, interval: [number | null, number | null]): [number, number] {
    if (this.meta.isCategorical[f]) console.warn(`categorical feature ${f} cannot call this function!`);
    const range = this.meta.ranges[f];
    const i0 = interval[0] || range[0];
    const i1 = interval[1] || range[1];
    const step = (range[1] - range[0]) / nBins;
    return [(i0 - range[0]) / step, (i1 - range[0]) / step];
  }
}

export interface Surrogate extends ModelBase {
  readonly target: string;  // the name of the target model
}

export function isSurrogate(model: ModelBase): model is Surrogate {
  return (<Surrogate> model).target !== undefined;
}
