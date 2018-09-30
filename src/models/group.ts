import { Rule, RuleGroup, isRuleGroup, Condition } from './ruleModel';

import * as nt from '../service/num';

/**
 * A function that group an array of rules to a single RuleGroup. 
 * The input rules can contain RuleGroup, which will be handled properly.
 * @export
 * @param {Rule[]} rules 
 * @returns {(Rule | RuleGroup)} 
 */
export function groupRules(rules: Rule[]): Rule | RuleGroup {
  if (rules.length === 0) throw 'The length of the rules to be grouped should be at least 1';
  if (rules.length === 1) {
    let _ret = {...(rules[0]), rules};
    _ret.rules[0].parent = _ret;
    return _ret;
  }
  let nested: Rule[] = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (isRuleGroup(rule)) {
      nested = nested.concat(rule.rules);
    } else {
      nested.push(rule);
    }
  }
  const supports: number[][][] = []; 
  const _supports: number[][] = [];
  nested.forEach((rule) => {
    if (rule.support)
      supports.push(rule.support);
    if (rule._support) {
      _supports.push(rule._support);
    }
  });
  let support: number[][] | undefined;
  let _support: number[] | undefined;
  // let fidelity: number;
  if (supports.length > 0) {
    support = nt.sumMat(supports as number[][][]);
    // _support = nt.sumVec(support);
    _support = nt.sumVec(support);
  } else if (_supports.length > 0) {
    _support = nt.sumVec(_supports);
  }
  const totalSupport = _support && nt.sum(_support);
  const cover = nt.sum(rules.map(r => r.cover));
  const output = nt.sumVec(nested.map(r => nt.muls(r.output, r.cover / cover)));
  const label = nt.argMax(output);
  const fidelity = (_support && totalSupport) && (_support[label] / totalSupport);
  const conditions: Condition[] = [];
  rules.forEach((r, i) => {
    const conds = r.conditions.map((c) => ({...c, rank: i}));
    conditions.push(...conds);
  });
  const ret = { rules, support, _support, output, label, totalSupport, conditions, idx: rules[0].idx, cover, fidelity };
  rules.forEach((r) => r.parent = ret);
  return ret;
}

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
export function groupRulesBy(rules: Rule[], filter: (rule: Rule, i?: number, rules?: Rule[]) => boolean): Rule[] {
  const retRules: Rule[] = new Array();

  // let prevSum = 0.;
  let tmpRules: Rule[] = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (filter(rule, i, rules)) {
      if (tmpRules.length > 0) {
        retRules.push(groupRules(tmpRules));
        tmpRules = [];
        // prevSum = 0.;
      }
      retRules.push(rule);
    } else {
      tmpRules.push(rule);
      // prevSum += rule.totalSupport;
    }
  }
  if (tmpRules.length) {
    retRules.push(groupRules(tmpRules));
  }
  return retRules;
}

export function groupBySupport(rules: Rule[], minSupport: number = 0.01): Rule[] {
  // const retRules: Rule[] = new Array();

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
  return groupRulesBy(rules, (rule: Rule) => rule.totalSupport === undefined ? true : rule.totalSupport >= minSupport);
}

// export function groupBy