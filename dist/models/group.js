"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ruleModel_1 = require("./ruleModel");
var nt = require("../service/num");
/**
 * A function that group an array of rules to a single RuleGroup.
 * The input rules can contain RuleGroup, which will be handled properly.
 * @export
 * @param {Rule[]} rules
 * @returns {(Rule | RuleGroup)}
 */
function groupRules(rules) {
    if (rules.length === 0)
        throw 'The length of the rules to be grouped should be at least 1';
    if (rules.length === 1) {
        var _ret = tslib_1.__assign({}, (rules[0]), { rules: rules });
        _ret.rules[0].parent = _ret;
        return _ret;
    }
    var nested = [];
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (ruleModel_1.isRuleGroup(rule)) {
            nested = nested.concat(rule.rules);
        }
        else {
            nested.push(rule);
        }
    }
    var supports = [];
    var _supports = [];
    nested.forEach(function (rule) {
        if (rule.support)
            supports.push(rule.support);
        if (rule._support) {
            _supports.push(rule._support);
        }
    });
    var support;
    var _support;
    // let fidelity: number;
    if (supports.length > 0) {
        support = nt.sumMat(supports);
        // _support = nt.sumVec(support);
        _support = nt.sumVec(support);
    }
    else if (_supports.length > 0) {
        _support = nt.sumVec(_supports);
    }
    var totalSupport = _support && nt.sum(_support);
    var cover = nt.sum(rules.map(function (r) { return r.cover; }));
    var output = nt.sumVec(nested.map(function (r) { return nt.muls(r.output, r.cover / cover); }));
    var label = nt.argMax(output);
    var fidelity = (_support && totalSupport) && (_support[label] / totalSupport);
    var conditions = [];
    rules.forEach(function (r, i) {
        var conds = r.conditions.map(function (c) { return (tslib_1.__assign({}, c, { rank: i })); });
        conditions.push.apply(conditions, tslib_1.__spread(conds));
    });
    var ret = { rules: rules, support: support, _support: _support, output: output, label: label, totalSupport: totalSupport, conditions: conditions, idx: rules[0].idx, cover: cover, fidelity: fidelity };
    rules.forEach(function (r) { return r.parent = ret; });
    return ret;
}
exports.groupRules = groupRules;
/**
 * Filter unsatisfied rules.
 * The filter function will be called for each rule.
 * If `filter` return false, then the rule will be grouped.
 * Multiple false rules will be grouped together.
 *
 * @export
 * @param {Rule[]} rules
 * @param {(rule: Rule, i?: number, rules?: Rule[]) => boolean} filter
 * @returns {Rule[]}
 */
function groupRulesBy(rules, filter) {
    var retRules = new Array();
    // let prevSum = 0.;
    var tmpRules = [];
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (filter(rule, i, rules)) {
            if (tmpRules.length > 0) {
                retRules.push(groupRules(tmpRules));
                tmpRules = [];
                // prevSum = 0.;
            }
            retRules.push(rule);
        }
        else {
            tmpRules.push(rule);
            // prevSum += rule.totalSupport;
        }
    }
    if (tmpRules.length) {
        retRules.push(groupRules(tmpRules));
    }
    return retRules;
}
exports.groupRulesBy = groupRulesBy;
function groupBySupport(rules, minSupport) {
    // const retRules: Rule[] = new Array();
    if (minSupport === void 0) { minSupport = 0.01; }
    // // let prevSum = 0.;
    // let tmpRules: Rule[] = [];
    // for (let i = 0; i < rules.length; i++) {
    //   const rule = rules[i];
    //   if (rule.totalSupport >= minSupport) {
    //     if (tmpRules.length > 0) {
    //       retRules.push(groupRules(tmpRules));
    //       tmpRules = [];
    //       // prevSum = 0.;
    //     }
    //     retRules.push(rule);
    //   } else {
    //     tmpRules.push(rule);
    //     // prevSum += rule.totalSupport;
    //   }
    // }
    // if (tmpRules.length) {
    //   retRules.push(groupRules(tmpRules));
    // }
    // return retRules;
    return groupRulesBy(rules, function (rule) { return rule.totalSupport === undefined ? true : rule.totalSupport >= minSupport; });
}
exports.groupBySupport = groupBySupport;
// export function groupBy
