"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function isMat(a) {
    if (a && a.length)
        return Array.isArray(a[0]);
    return false;
}
exports.isMat = isMat;
function muls(a, b, copy) {
    if (copy === void 0) { copy = true; }
    var ret = copy ? a.slice() : a;
    for (var i = 0; i < ret.length; ++i)
        ret[i] *= b;
    return ret;
}
exports.muls = muls;
function mul(a, b, copy) {
    if (copy === void 0) { copy = true; }
    if (a.length !== b.length) {
        throw 'Length of a and b must be equal!';
    }
    var ret = copy ? a.slice() : a;
    for (var i = 0; i < ret.length; ++i)
        ret[i] *= b[i];
    return ret;
}
exports.mul = mul;
function add(a, b, copy) {
    if (copy === void 0) { copy = true; }
    if (a.length !== b.length) {
        throw 'Length of a and b must be equal!';
    }
    var ret = copy ? a.slice() : a;
    for (var i = 0; i < ret.length; ++i)
        ret[i] += b[i];
    return ret;
}
exports.add = add;
function minus(a, b, copy) {
    if (copy === void 0) { copy = true; }
    if (a.length !== b.length) {
        throw 'Length of a and b must be equal!';
    }
    var ret = copy ? a.slice() : a;
    for (var i = 0; i < ret.length; ++i)
        ret[i] -= b[i];
    return ret;
}
exports.minus = minus;
function addMat(a, b, copy) {
    if (copy === void 0) { copy = true; }
    if (a.length !== b.length) {
        throw 'Length of a and b must be equal!';
    }
    var ret = copy ? a.map(function (_a) { return _a.slice(); }) : a;
    for (var i = 0; i < ret.length; ++i)
        add(ret[i], b[i], false);
    return ret;
}
exports.addMat = addMat;
function sum(arr) {
    var _sum = 0;
    for (var i = 0; i < arr.length; ++i) {
        _sum += arr[i];
    }
    return _sum;
}
exports.sum = sum;
function mean(arr) {
    return sum(arr) / arr.length;
}
exports.mean = mean;
function cumsum(a) {
    // if (a instanceof nj.NdArray)
    var arr = a.slice();
    for (var i = 1; i < arr.length; ++i) {
        arr[i] += arr[i - 1];
    }
    return arr;
}
exports.cumsum = cumsum;
function stack(arrs) {
    var ret = arrs.map(function (arr) { return arr.slice(); });
    for (var i = 1; i < ret.length; i++) {
        add(ret[i], ret[i - 1], false);
    }
    return ret;
}
exports.stack = stack;
function sumVec(arrs) {
    // if (arrs.length === 0) return ;
    var _sum = arrs[0].slice();
    for (var i = 1; i < arrs.length; ++i) {
        add(_sum, arrs[i], false);
    }
    return _sum;
}
exports.sumVec = sumVec;
function sumMat(arrs) {
    var _sum = arrs[0].map(function (arr) { return arr.slice(); });
    for (var i = 1; i < arrs.length; ++i) {
        addMat(_sum, arrs[i], false);
    }
    return _sum;
}
exports.sumMat = sumMat;
function argMax(arr) {
    if (arr.length === 0)
        return -1;
    var maxIdx = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[maxIdx] < arr[i])
            maxIdx = i;
    }
    return maxIdx;
}
exports.argMax = argMax;
function argMin(arr) {
    if (arr.length === 0)
        return -1;
    var minIdx = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < arr[minIdx])
            minIdx = i;
    }
    return minIdx;
}
exports.argMin = argMin;
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
