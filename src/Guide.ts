import '../node_modules/intro.js/introjs.css';

const { introJs } = require('intro.js');

export const introStart = () => introJs()
  .addSteps([
      { 
        intro: 'Welcome using the guide of RuleMatrix!'
      },
      {
        element: document.querySelectorAll('.rules')[0],
        intro: 'This is the Rule Matrix.',
        position: 'right'
      },
      {
        element: document.querySelectorAll('.matrix-rule')[0],
        intro: 'Each row represents the condition of a rule (the IF part)'
      },
      {
        element: document.querySelectorAll('.header')[0],
        intro: 'Each column represents a feature. You can click to highlight a column.',
        position: 'top'
      },
      {
        element: document.querySelectorAll('.matrix-condition')[0],
        intro: 'If a rule uses a feature in the condition part, then a small histogram is shown.',
        position: 'top'
      },
      {
        element: document.querySelectorAll('.hp-brush')[0],
        intro: 'The gray box represents the constraint on the feature. The satisfied part is also highlighted.\n\
        Click to expand the cell to see the detail distribution!',
        position: 'top'
      },
      {
        element: document.querySelectorAll('.mo-output')[0],
        intro: 'This is the output of the rule. \n\
        The color represents the label. \nThe number represents the probability.',
        position: 'right'
      },
      {
        element: document.querySelectorAll('.flows')[0],
        intro: 'This is the Data Flow, visualized as a Sankey diagram.',
        position: 'right'
      },
      {
        element: document.querySelectorAll('.v-reserves')[0],
        intro: 'The width represents the amount of data. Color encodes the label of the data.',
        position: 'right'
      },
      {
        element: document.querySelectorAll('.v-flows')[0],
        intro: 'The out flow represents the part of the data that satisfies the rule.\n\
        Color also encodes the label.\n\
        Hover to see the detail number.',
        position: 'right'
      },
      {
        element: document.querySelectorAll('.mo-fidelity')[0],
        intro: 'Fidelity means how reliable the rule is in representing the original model. \n\
        The higher the value, the better the rule approximate the original model.',
        position: 'right'
      },
      {
        intro: 'Thanks for taking the tour!',
      },
    ]
  )
  .start();
