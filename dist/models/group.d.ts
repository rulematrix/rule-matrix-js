import { Rule, RuleGroup } from './ruleModel';
/**
 * A function that group an array of rules to a single RuleGroup.
 * The input rules can contain RuleGroup, which will be handled properly.
 * @export
 * @param {Rule[]} rules
 * @returns {(Rule | RuleGroup)}
 */
export declare function groupRules(rules: Rule[]): Rule | RuleGroup;
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
export declare function groupRulesBy(rules: Rule[], filter: (rule: Rule, i?: number, rules?: Rule[]) => boolean): Rule[];
export declare function groupBySupport(rules: Rule[], minSupport?: number): Rule[];
