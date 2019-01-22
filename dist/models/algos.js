"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var ruleModel_1 = require("./ruleModel");
function rankRuleFeatures(rules, nFeatures) {
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
exports.rankRuleFeatures = rankRuleFeatures;
function rankModelFeatures(model) {
    if (ruleModel_1.isRuleModel(model))
        return rankRuleFeatures(model.rules, model.nFeatures);
    else {
        console.warn('Not Implemented!');
        return d3.range(model.nFeatures);
    }
}
exports.rankModelFeatures = rankModelFeatures;
