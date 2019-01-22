import * as tslib_1 from "tslib";
import { default as RuleMatrix } from './components/RuleMatrix';
import { default as RuleMatrixApp } from './RuleMatrixApp';
import * as models from './models';
import * as painters from './components/Painters';
module.exports = tslib_1.__assign({ RuleMatrix: RuleMatrix,
    RuleMatrixApp: RuleMatrixApp }, models, painters);
