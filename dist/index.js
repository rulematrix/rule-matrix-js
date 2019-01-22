var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var RuleMatrix = require('./components/RuleMatrix');
var RuleMatrixApp = require('./RuleMatrixApp');
var models = require('./models');
var painters = require('./components/Painters');
module.exports = __assign({ RuleMatrix: RuleMatrix,
    RuleMatrixApp: RuleMatrixApp }, models, painters);
