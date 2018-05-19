export type Vector =
  | Array<number>
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array;

// export type DType = 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';

// export interface Array2D<T extends Vector> {
//   size: number;
//   shape: [number, number];
//   dtype: DType;
//   data: T;
// }

// export class Matrix<T extends Vector> implements Array2D<T> {
//   public size: number;
//   public shape: [number, number];
//   public dtype: DType;
//   public data: T;
//   public get(i: number, j: number) {
//     return this.data[i * this.shape[0] + j];
//   }
//   public set(i: number, j: number, v: number) {
//     this.data[i * this.shape[0] + j] = v;
//   }
// }

export function isMat(a: number[] | number[][]): a is number[][] {
  if (a.length)
    return Array.isArray(a[0]);
  return false;
}

export function muls<T extends Vector>(a: T, b: number, copy: boolean = true): T {
  const ret = copy ? a.slice() as T : a;
  for (let i = 0; i < ret.length; ++i)
    ret[i] *= b;
  return ret;
}

export function mul<T extends Vector>(a: T, b: T, copy: boolean = true): T {
  if (a.length !== b.length) {
    throw 'Length of a and b must be equal!';
  }
  const ret = copy ? a.slice() as T : a;
  for (let i = 0; i < ret.length; ++i)
    ret[i] *= b[i];
  return ret;
}

export function add<T extends Vector>(a: T, b: T, copy: boolean = true): T {
  if (a.length !== b.length) {
    throw 'Length of a and b must be equal!';
  }
  const ret = copy ? a.slice() as T : a;
  for (let i = 0; i < ret.length; ++i)
    ret[i] += b[i];
  return ret;
}

export function minus<T extends Vector>(a: T, b: T, copy: boolean = true): T {
  if (a.length !== b.length) {
    throw 'Length of a and b must be equal!';
  }
  const ret = copy ? a.slice() as T : a;
  for (let i = 0; i < ret.length; ++i)
    ret[i] -= b[i];
  return ret;
}

export function addMat<T extends Vector>(a: T[], b: T[], copy: boolean = true): T[] {
  if (a.length !== b.length) {
    throw 'Length of a and b must be equal!';
  }
  const ret = copy ? a.map((_a: T) => _a.slice() as T) : a;
  for (let i = 0; i < ret.length; ++i)
    add(ret[i], b[i], false);
  return ret;
}

export function sum<T extends Vector>(arr: T): number {
  let _sum: number = 0;
  for (let i = 0; i < arr.length; ++i) {
    _sum += arr[i];
  }
  return _sum;
}

export function mean<T extends Vector>(arr: T): number {
  return sum(arr) / arr.length;
}

export function cumsum<T extends Vector>(a: T): T {
  // if (a instanceof nj.NdArray)
  const arr = a.slice() as T;
  for (let i = 1; i < arr.length; ++i) {
    arr[i] += arr[i - 1];
  }
  return arr;
}

export function stack<T extends Vector>(arrs: T[]): T[] {
  const ret = arrs.map((arr: T) => arr.slice() as T);
  for (let i = 1; i < ret.length; i++) {
    add(ret[i], ret[i - 1], false);
  }
  return ret;
}

export function sumVec<T extends Vector>(arrs: T[]): T {
  // if (arrs.length === 0) return ;
  let _sum: T = arrs[0].slice() as T;
  for (let i = 1; i < arrs.length; ++i) {
    add(_sum, arrs[i], false);
  }
  return _sum;
}

export function sumMat<T extends Vector>(arrs: T[][]): T[] {
  let _sum = arrs[0].map((arr: T) => arr.slice() as T);
  for (let i = 1; i < arrs.length; ++i) {
    addMat(_sum, arrs[i], false);
  }
  return _sum;
}

export function argMax<T extends Vector>(arr: T): number {
  if (arr.length === 0) return -1;
  let maxIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[maxIdx] < arr[i] ) maxIdx = i;
  }
  return maxIdx;
}

export function argMin<T extends Vector>(arr: T): number {
  if (arr.length === 0) return -1;
  let minIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[minIdx]) minIdx = i;
  }
  return minIdx;
}

// export function 

// export function sum<T = number>(a: nj.NdArrayLike<T>, axis?: number): nj.NdArray<T> {
//   // if (axis === undefined) return _sum(a);
//   const dim = axis ? axis : 0;
//   const arr = nj.array<T>(a);
//   const ret = nj.zeros<T>([...(arr.shape.slice(0, dim)), ...(arr.shape.slice(dim + 1))], arr.dtype);
//   const nulls = arr.shape.map(() => null);
//   const starts  = nulls.slice(0, dim);
//   const ends = nulls.slice(dim + 1, 0);
//   for (let i = 0; i < arr.shape[dim]; i++) {
//     ret.add(arr.pick(...starts, i, ...ends), false);
//   }
//   return ret;
// }
