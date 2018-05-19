import * as d3 from 'd3';
import { Rule, Condition, isRuleModel } from './ruleModel';
import { ModelBase } from './base';

export function rankRuleFeatures(rules: Rule[], nFeatures: number): number[] {
  const featureImportance = new Array(nFeatures).fill(0);
  rules.forEach((r: Rule) => {
    r.conditions.forEach((c: Condition) => {
      featureImportance[c.feature] += r.cover;
    });
  });
  const features = d3.range(nFeatures);
  features.sort((i, j) => featureImportance[j] - featureImportance[i]);
  return features;
}

export function rankModelFeatures(model: ModelBase): number[] {
  if (isRuleModel(model)) return rankRuleFeatures(model.rules, model.nFeatures);
  else {
    console.warn('Not Implemented!');
    return d3.range(model.nFeatures);
  }
}