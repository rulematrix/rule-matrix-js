import * as d3 from 'd3';
import { isRuleModel } from './ruleModel';
export function rankRuleFeatures(rules, nFeatures) {
    var featureImportance = new Array(nFeatures).fill(0);
    rules.forEach(function (r) {
        r.conditions.forEach(function (c) {
            featureImportance[c.feature] += r.cover;
        });
    });
    var features = d3.range(nFeatures);
    features.sort(function (i, j) { return featureImportance[j] - featureImportance[i]; });
    return features;
}
export function rankModelFeatures(model) {
    if (isRuleModel(model))
        return rankRuleFeatures(model.rules, model.nFeatures);
    else {
        console.warn('Not Implemented!');
        return d3.range(model.nFeatures);
    }
}
