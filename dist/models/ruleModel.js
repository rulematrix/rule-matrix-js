"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var nt = require("../service/num");
var data_1 = require("./data");
var config_1 = require("../config");
function updateRuleSupport(r, support) {
    if (support) {
        if (nt.isMat(support)) {
            r.support = support;
            r._support = nt.sumVec(r.support);
            r.totalSupport = nt.sum(r._support);
            r.fidelity = r._support[r.label] / r.totalSupport;
        }
        else {
            r.support = undefined;
            r._support = support;
            r.totalSupport = nt.sum(r._support);
            r.fidelity = undefined;
        }
    }
    else {
        r.support = r._support = r.totalSupport = r.fidelity = undefined;
    }
}
exports.updateRuleSupport = updateRuleSupport;
function isRuleGroup(rule) {
    return rule.rules !== undefined;
}
exports.isRuleGroup = isRuleGroup;
function isRuleModel(model) {
    return model.type === 'rule';
}
exports.isRuleModel = isRuleModel;
function toString(n, precision) {
    if (precision === void 0) { precision = 1; }
    var bit = Math.floor(Math.log10(n));
    if (bit < -precision - 1)
        return n.toExponential(precision);
    if (bit < precision)
        return n.toFixed(precision - bit);
    if (bit < precision + 3)
        return n.toFixed(0);
    return n.toPrecision(precision + 1);
}
var RuleList = /** @class */ (function () {
    function RuleList(raw) {
        var type = raw.type, name = raw.name, nFeatures = raw.nFeatures, nClasses = raw.nClasses, meta = raw.meta, rules = raw.rules, supports = raw.supports, discretizers = raw.discretizers;
        this.type = type;
        this.name = name;
        this.nFeatures = nFeatures;
        this.nClasses = nClasses;
        this.meta = meta;
        this.rules = rules;
        this.supports = supports;
        this.discretizers = discretizers;
        this.rules.forEach(function (r, i) {
            if (r.support) {
                if (nt.isMat(r.support)) {
                    r._support = r.support.map(function (s) { return nt.sum(s); });
                }
                else {
                    r._support = r.support;
                    r.support = undefined;
                }
            }
        });
        this.maxSupport = d3.max(supports, nt.sum) || 0.1;
        // this.minSupport = 0.01;
        this.useSupportMat = false;
        // if (target) this.target = target;
        // bind this
        this.categoryInterval = this.categoryInterval.bind(this);
        this.categoryDescription = this.categoryDescription.bind(this);
        this.categoryHistRange = this.categoryHistRange.bind(this);
        this.interval2HistRange = this.interval2HistRange.bind(this);
    }
    RuleList.prototype.support = function (newSupport) {
        if (newSupport.length !== this.rules.length) {
            throw "Shape not match! newSupport has length " + newSupport.length + ", but " + this.rules.length + " is expected";
        }
        if (data_1.isSupportMat(newSupport)) {
            this.supportMats = newSupport;
            this.rules.forEach(function (r, i) { return (r.support = newSupport[i]); });
            this.useSupportMat = true;
            this.maxSupport = d3.max(newSupport, function (mat) { return nt.sum(nt.sumVec(mat)); }) || 0.1;
        }
        else {
            this.supports = newSupport;
            this.useSupportMat = false;
            this.maxSupport = d3.max(newSupport, nt.sum) || 0.1;
        }
        this.rules.forEach(function (r, i) {
            updateRuleSupport(r, newSupport[i]);
        });
        // console.log('Support changed'); // tslint:disable-line
        return this;
    };
    RuleList.prototype.getSupport = function () {
        return this.supports;
    };
    RuleList.prototype.predict = function (data) {
        if (data.length !== this.meta.featureNames.length) {
            console.warn('The input data does not has the same length as the featureNames!');
        }
        var rules = this.rules;
        var discretizers = this.discretizers;
        for (var i = 0; i < rules.length; i++) {
            var conditions = rules[i].conditions;
            var flags = conditions.map(function (_a) {
                var feature = _a.feature, category = _a.category;
                var intervals = discretizers[feature].intervals;
                if (intervals) {
                    var interval = intervals[category];
                    var low = interval[0] || -Infinity;
                    var high = interval[1] || Infinity;
                    return low < data[feature] && data[feature] < high;
                }
                return data[feature] === category;
            });
            if (flags.every(function (f) { return f; }))
                return i;
        }
        return rules.length - 1;
    };
    RuleList.prototype.getRules = function () {
        return this.rules;
    };
    RuleList.prototype.categoryInterval = function (f, c) {
        if (f < 0 || c < 0)
            return [0, 0];
        var ranges = this.meta.ranges;
        var intervals = this.discretizers[f].intervals;
        if (intervals) {
            var _a = tslib_1.__read(intervals[c], 2), r0 = _a[0], r1 = _a[1];
            return [r0 === null ? ranges[f][0] : r0, r1 === null ? ranges[f][1] : r1];
        }
        return [c - 0.5, c + 0.5];
    };
    RuleList.prototype.categoryMathDesc = function (f, c) {
        if (f < 0 || c < 0)
            return 'default';
        var intervals = this.discretizers[f].intervals;
        if (intervals) {
            // console.log(c); // tslint:disable-line
            var _a = tslib_1.__read(intervals[c], 2), r0 = _a[0], r1 = _a[1];
            return (r0 === null ? '(∞' : "[" + toString(r0)) + "," + (r1 === null ? '∞' : toString(r1)) + ")";
        }
        var categories = this.meta.categories[f];
        return categories ? categories[c] : 'error!';
    };
    RuleList.prototype.categoryDescription = function (f, c, abr, maxLength) {
        if (abr === void 0) { abr = false; }
        if (maxLength === void 0) { maxLength = 20; }
        if (f < 0 || c < 0)
            return '';
        var _a = this.meta, featureNames = _a.featureNames, categories = _a.categories;
        var cutSize = Math.round((maxLength - 2) / 2);
        var featureName = featureNames[f];
        var intervals = this.discretizers[f].intervals;
        var category = intervals ? intervals[c] : c;
        var featureMap = function (feature) { return feature + " is any"; };
        if (typeof category === 'number' && categories) {
            featureMap = function (feature) { return feature + " = " + categories[f][c]; };
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
        if (abr) {
            var abrString = featureName.length > maxLength
                ? "\"" + featureName.substr(0, cutSize) + "\u2026" + featureName.substr(-cutSize, cutSize) + "\""
                : featureName;
            return featureMap(abrString);
        }
        return featureMap(featureName);
    };
    RuleList.prototype.categoryHistRange = function (f, c) {
        if (this.meta.isCategorical[f])
            return [c - 0.5, c + 0.5];
        return this.interval2HistRange(f, this.categoryInterval(f, c));
    };
    RuleList.prototype.interval2HistRange = function (f, interval) {
        if (this.meta.isCategorical[f])
            console.warn("categorical feature " + f + " cannot call this function!");
        var range = this.meta.ranges[f];
        var i0 = interval[0] || range[0];
        var i1 = interval[1] || range[1];
        var step = (range[1] - range[0]) / config_1.nBins;
        return [(i0 - range[0]) / step, (i1 - range[0]) / step];
    };
    return RuleList;
}());
exports.RuleList = RuleList;
