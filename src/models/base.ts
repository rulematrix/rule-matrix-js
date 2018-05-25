// import { nBins } from '../config';

export interface ModelMeta {
  readonly featureNames: string[];
  readonly labelNames: string[];
  readonly isCategorical: boolean[];
  readonly ranges: [number, number][];
  readonly categories: (string[] | null)[];
}

export interface ModelBase {
  readonly type: string;
  readonly name: string;
  // readonly dataset: string;
  readonly nFeatures: number;
  readonly nClasses: number;
  readonly meta: ModelMeta;
  // predict(input: number[]): number;
  // predict(input: number[][]): number[];
  // [propName: string]: any;
}

export interface Classifier extends ModelBase {
  predict(input: number[]): number;
  predict(input: number[][]): number[];
}

export interface Surrogate extends ModelBase {
  readonly target: string;  // the name of the target model
}

export function isSurrogate(model: ModelBase): model is Surrogate {
  return (<Surrogate> model).target !== undefined;
}
