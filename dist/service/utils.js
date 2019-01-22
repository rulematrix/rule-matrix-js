// export function max
import * as tslib_1 from "tslib";
import { isRuleModel, } from '../models';
export function countFeatureFreq(model, nFeatures) {
    var counts = new Array(nFeatures);
    counts.fill(0);
    if (isRuleModel(model)) {
        model.rules.forEach(function (rule) {
            rule.conditions.forEach(function (c) {
                counts[c.feature]++;
            });
        });
    }
    return counts;
}
var MAX_STR_LEN = 16;
var CUT_SIZE = (MAX_STR_LEN - 2) / 2;
export function condition2String(featureName, category) {
    var abrString = featureName.length > MAX_STR_LEN
        ? "\"" + featureName.substr(0, CUT_SIZE) + "\u2026" + featureName.substr(-CUT_SIZE, CUT_SIZE) + "\""
        : featureName;
    var featureMap = function (feature) { return feature + " is any"; };
    if (typeof category === 'number') {
        featureMap = function (feature) { return feature + " = " + category; };
    }
    else {
        var low = category[0];
        var high = category[1];
        if (low === null && high === null)
            featureMap = function (feature) { return feature + " is any"; };
        else {
            var lowString_1 = low !== null ? low.toPrecision(3) + " < " : '';
            var highString_1 = high !== null ? " < " + high.toPrecision(3) : '';
            featureMap = function (feature) { return lowString_1 + feature + highString_1; };
        }
    }
    return {
        tspan: featureMap(abrString),
        title: featureMap(featureName)
    };
}
// export function memorize<T>()
export function memorizePromise(f) {
    var cache = {};
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        var key = a.map(function (e) { return JSON.stringify(a); }).join(',');
        if (key in cache)
            return Promise.resolve(cache[key].data);
        else
            return f.apply(void 0, tslib_1.__spread(a)).then(function (data) {
                cache[key] = { data: data, count: 0 };
                return data;
            });
    };
}
