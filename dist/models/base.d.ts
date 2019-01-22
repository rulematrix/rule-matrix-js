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
    readonly nFeatures: number;
    readonly nClasses: number;
    readonly meta: ModelMeta;
}
export interface Classifier extends ModelBase {
    predict(input: number[]): number;
    predict(input: number[][]): number[];
}
export interface Surrogate extends ModelBase {
    readonly target: string;
}
export declare function isSurrogate(model: ModelBase): model is Surrogate;
