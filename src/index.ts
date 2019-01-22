const RuleMatrix = require('./components/RuleMatrix');
const RuleMatrixApp = require('./RuleMatrixApp');
const models = require('./models');
const painters = require('./components/Painters');

module.exports = {
  RuleMatrix,
  RuleMatrixApp,
  ...models,
  ...painters,
};
