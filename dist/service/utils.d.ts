import { ModelBase } from '../models';
export declare function countFeatureFreq(model: ModelBase, nFeatures: number): (number | undefined)[];
export declare function condition2String(featureName: string, category: (number | null)[] | number): {
    tspan: string;
    title: string;
};
export interface Cache<T> {
    count: number;
    data: T;
}
export declare function memorizePromise<T>(f: (...a: any[]) => Promise<T>): (...a: any[]) => Promise<T>;
