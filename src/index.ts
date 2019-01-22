import { default as RuleMatrix } from './components/RuleMatrix';
import { default as RuleMatrixApp } from './RuleMatrixApp';
import * as models from './models';
import * as painters from './components/Painters';

module.exports = {
  RuleMatrix,
  RuleMatrixApp,
  ...models,
  ...painters,
};
