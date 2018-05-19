import * as d3 from 'd3';
// DataSets

export type DataType = 'train' | 'test';
export type SurrogateDataType = 'sample train' | 'sample test';
export type DataTypeX = DataType | SurrogateDataType;

export type PlainMatrix = number[][];

export type Histogram = number[];

export interface BasicData {
  data: number[][];
  target: number[];
  end: number;
  totalLength: number;
}

export interface PlainData {
  data: number[][];
  target: number[];
  hists: Histogram[];
  name: DataTypeX;
  ratios: number[][];
  // readonly discretizers: Discretizer[];
}

export type StreamLayer = number[];

export interface Stream {
  stream: StreamLayer[];
  xs: number[];
  yMax: number;
  processed?: boolean;
}

export type Streams = Stream[];

export type ConditionalStreams = Streams[];

export function createStreams(raw: Streams): Streams {
  raw.forEach((stream: Stream) => {
    if (!stream.processed) {
      stream.stream = d3.transpose(stream.stream);
      stream.processed = true;
    }
  });
  return raw;
}

export function createConditionalStreams(raw: ConditionalStreams): ConditionalStreams {
  return raw.map((streams: Streams) => createStreams(streams));
}

export function isConditionalStreams(streams: Streams | ConditionalStreams): streams is ConditionalStreams {
  return Array.isArray(streams[0]);
}

export class DataSet {
  public data: Float32Array[];
  public target: Int32Array;
  public hists: Histogram[];
  public name: DataTypeX;
  public ratios: number[][];
  // public discretizers: Discretizer[];
  public streams?: Streams;
  public conditionalStreams?: ConditionalStreams;
  constructor(raw: PlainData) {
    const { data, target, hists, name, ratios } = raw;
    this.data = data.map((d: number[]) => new Float32Array(d));
    this.target = new Int32Array(target);
    this.hists = hists;
    this.name = name;
    this.ratios = ratios;
    // this.discretizers = discretizers;

    // this.categoryInterval = this.categoryInterval.bind(this);
    // this.categoryDescription = this.categoryDescription.bind(this);
    // this.categoryHistRange = this.categoryHistRange.bind(this);
    // this.interval2HistRange = this.interval2HistRange.bind(this);
    // this.categorical = categorical;
  }
}

export class Matrix {
  data: Float32Array;
  size1: number;
  size2: number;
  constructor(size1: number, size2: number) {
    this.data = new Float32Array(size1 * size2);
  }
  // get_column()
}

export type Support = number[][];

export type SupportMat = number[][][];

export type SupportType = Support | SupportMat;

export function isSupportMat(support: SupportType): support is SupportMat {
  return Array.isArray(support[0][0]);
}