export declare type DataType = 'train' | 'test';
export declare type SurrogateDataType = 'sample train' | 'sample test';
export declare type DataTypeX = DataType | SurrogateDataType;
export declare type PlainMatrix = number[][];
export declare type Histogram = number[];
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
}
export declare type StreamLayer = number[];
export interface Stream {
    stream: StreamLayer[];
    xs: number[];
    yMax: number;
    processed?: boolean;
}
export declare type Streams = Stream[];
export declare type ConditionalStreams = Streams[];
export declare function createStreams(raw: Streams): Streams;
export declare function createConditionalStreams(raw: ConditionalStreams): ConditionalStreams;
export declare function isConditionalStreams(streams: Streams | ConditionalStreams): streams is ConditionalStreams;
export declare class DataSet {
    data: Float32Array[];
    target: Int32Array;
    hists: Histogram[];
    name: DataTypeX;
    ratios: number[][];
    streams?: Streams;
    conditionalStreams?: ConditionalStreams;
    constructor(raw: PlainData);
}
export declare class Matrix {
    data: Float32Array;
    size1: number;
    size2: number;
    constructor(size1: number, size2: number);
}
export declare type Support = number[][];
export declare type SupportMat = number[][][];
export declare type SupportType = Support | SupportMat;
export declare function isSupportMat(support: SupportType): support is SupportMat;
